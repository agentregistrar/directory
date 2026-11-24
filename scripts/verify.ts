import { execFile, execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { getEntries } from "../src/lib/entries";
import type { Entry } from "../src/lib/entry-schema";
import {
  verificationFileSchema,
  type VerificationEntry,
  type VerificationFile,
} from "../src/lib/verification-schema";

const root = process.cwd();
const verificationPath = join(root, "data", "verification.json");
const cliPath = join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "discovery.cmd" : "discovery",
);

const rawArgs = process.argv.slice(2);
const entryIndex = rawArgs.indexOf("--entry");
const onlySlug = entryIndex >= 0 ? rawArgs[entryIndex + 1] : null;
const flags = new Set(
  rawArgs.filter((arg) => arg.startsWith("--") && arg !== "--entry"),
);
const write = flags.has("--write");
const json = flags.has("--json");
const onlyChanged = flags.has("--only-changed");

type Result = {
  slug: string;
  name: string;
  ok: boolean;
  record: VerificationEntry;
};

function fail(message: string): never {
  console.error(message);
  process.exit(2);
}

function packageVersion(): string {
  const path = join(
    root,
    "node_modules",
    "@agentregistrar",
    "discovery",
    "package.json",
  );
  try {
    return JSON.parse(readFileSync(path, "utf8")).version as string;
  } catch {
    return "unknown";
  }
}

function changedSlugs(): Set<string> | null {
  try {
    const output = execFileSync(
      "git",
      ["diff", "--name-only", "origin/main...HEAD", "--", "data/entries"],
      { encoding: "utf8" },
    );
    return new Set(
      output
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((path) => path.split("/").pop() ?? ""),
    );
  } catch {
    return null;
  }
}

function runCli(
  args: string[],
): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(
      cliPath,
      args,
      { encoding: "utf8", timeout: 60_000, maxBuffer: 10 * 1024 * 1024 },
      (error, stdout, stderr) => {
        let code = 0;
        if (error) {
          const candidate = (error as NodeJS.ErrnoException & {
            code?: number | string;
          }).code;
          code = typeof candidate === "number" ? candidate : 1;
        }
        resolve({
          code,
          stdout: String(stdout ?? ""),
          stderr: String(stderr ?? ""),
        });
      },
    );
  });
}

function count(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.trunc(number) : 0;
}

async function checkEntry(entry: Entry): Promise<Result> {
  const result = await runCli([
    "validate",
    entry.discovery_url,
    "--json",
  ]);

  let parsed: Record<string, any> | null = null;
  let parseError: string | null = null;

  if (result.stdout.trim()) {
    try {
      parsed = JSON.parse(result.stdout);
    } catch (error) {
      parseError =
        error instanceof Error ? error.message : "validator output was not JSON";
    }
  }

  const errors: string[] = [];

  if (result.code === 2) {
    errors.push(
      "Could not fetch the discovery document. Check that the URL is public, HTTPS, and returns JSON.",
    );
  }

  if (parseError) {
    errors.push(`Validator output was not JSON: ${parseError}`);
  }

  if (!parsed && !parseError) {
    errors.push("Validator produced no output.");
  }

  if (parsed) {
    if (parsed.valid !== true) {
      const reported = Array.isArray(parsed.errors)
        ? parsed.errors.map(String)
        : [];
      errors.push(...(reported.length ? reported : ["The document did not pass the validator."]));
    }

    if (parsed.conformance?.valid !== true) {
      errors.push("The document did not pass conformance.");
    }

    if (parsed.protocol !== "agent-identity-protocol") {
      errors.push(
        `Unexpected protocol: ${typeof parsed.protocol === "string" ? parsed.protocol : "missing"}.`,
      );
    }

    if (parsed.protocolVersion !== entry.protocol_version) {
      errors.push(
        `Protocol version mismatch: expected ${entry.protocol_version}, got ${
          typeof parsed.protocolVersion === "string"
            ? parsed.protocolVersion
            : "missing"
        }.`,
      );
    }

    if (!parsed.audience) {
      errors.push("Discovery document has no audience.");
    }
  }

  const ok = result.code === 0 && errors.length === 0;
  const warnings = Array.isArray(parsed?.warnings)
    ? parsed.warnings.map(String)
    : [];

  const record: VerificationEntry = {
    status: ok ? "valid" : "failing",
    kind: "discovery",
    source: entry.discovery_url,
    checked_at: new Date().toISOString(),
    protocol:
      typeof parsed?.protocol === "string" ? parsed.protocol : null,
    protocol_version:
      typeof parsed?.protocolVersion === "string"
        ? parsed.protocolVersion
        : null,
    audience:
      typeof parsed?.audience === "string" ? parsed.audience : null,
    provider_name:
      typeof parsed?.providerName === "string" ? parsed.providerName : null,
    terms_url:
      typeof parsed?.terms?.url === "string" ? parsed.terms.url : null,
    counts: {
      passed: count(parsed?.counts?.passed),
      failed: count(parsed?.counts?.failed),
      warnings: count(parsed?.counts?.warnings),
    },
    errors: [...new Set(errors)],
    warnings,
  };

  return {
    slug: entry.slug,
    name: entry.name,
    ok,
    record,
  };
}

function readExisting(): VerificationFile | null {
  if (!existsSync(verificationPath)) {
    return null;
  }

  try {
    return verificationFileSchema.parse(
      JSON.parse(readFileSync(verificationPath, "utf8")),
    );
  } catch (error) {
    fail(
      `data/verification.json is invalid: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}

function writeVerification(
  allEntries: Entry[],
  results: Result[],
): void {
  const previous = readExisting();
  const entries = {
    ...(previous?.entries ?? {}),
    ...Object.fromEntries(results.map((result) => [result.slug, result.record])),
  };

  const validSlugs = new Set(allEntries.map((entry) => entry.slug));
  const cleaned = Object.fromEntries(
    Object.entries(entries).filter(([slug]) => validSlugs.has(slug)),
  );

  const file: VerificationFile = {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    validator_version: packageVersion(),
    entries: cleaned,
  };

  writeFileSync(
    verificationPath,
    `${JSON.stringify(verificationFileSchema.parse(file), null, 2)}\n`,
  );
}

function printHuman(results: Result[]): void {
  console.log("Agent Registrar Directory validation");
  console.log("");
  console.log("| Provider | Result | Details |");
  console.log("| :--- | :--- | :--- |");

  for (const result of results) {
    const details = result.ok
      ? `${result.record.counts.passed} checks passed, ${
          result.record.counts.warnings
        } warning${result.record.counts.warnings === 1 ? "" : "s"}, protocol ${
          result.record.protocol_version ?? "unknown"
        }`
      : result.record.errors.join("; ") || "Check failed.";
    console.log(
      `| ${result.name} | ${result.ok ? "Pass" : "Fail"} | ${details.replace(
        /\|/g,
        "\\|",
      )} |`,
    );
  }

  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;
  console.log("");
  console.log(`Result: ${passed} passed, ${failed} failed.`);
}

async function main(): Promise<void> {
  if (!existsSync(cliPath)) {
    fail("The @agentregistrar/discovery validator is not installed. Run pnpm install.");
  }

  const allEntries = getEntries();

  let selected = allEntries;

  if (onlySlug) {
    selected = allEntries.filter((entry) => entry.slug === onlySlug);
    if (selected.length === 0) {
      fail(`No entry found for --entry ${onlySlug}.`);
    }
  } else if (onlyChanged) {
    const changed = changedSlugs();
    if (changed) {
      selected = allEntries.filter(
        (entry) =>
          changed.has(`${entry.slug}.yaml`) || changed.has(`${entry.slug}.yml`),
      );
    }
  }

  if (selected.length === 0) {
    console.log("No entry changes to validate.");
    return;
  }

  const results: Result[] = [];
  for (const entry of selected) {
    results.push(await checkEntry(entry));
  }

  if (write) {
    writeVerification(allEntries, results);
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          valid: results.every((result) => result.ok),
          validator_version: packageVersion(),
          results,
        },
        null,
        2,
      ),
    );
  } else {
    printHuman(results);
  }

  if (!results.every((result) => result.ok)) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
