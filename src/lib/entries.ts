import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { entrySchema, type Entry } from "./entry-schema";
import {
  verificationFileSchema,
  type VerificationEntry,
} from "./verification-schema";

const entriesDir = join(process.cwd(), "data", "entries");
const verificationPath = join(process.cwd(), "data", "verification.json");
const MAX_ENTRY_BYTES = 16 * 1024;

type VerificationMeta = {
  entries: Record<string, VerificationEntry>;
  validatorVersion: string | null;
};

export type ProviderEntry = Entry & {
  verification: VerificationEntry | null;
  validatorVersion: string | null;
  status: "valid" | "failing" | "unchecked";
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function readVerification(): VerificationMeta {
  if (!existsSync(verificationPath)) {
    return { entries: {}, validatorVersion: null };
  }

  try {
    const parsed = verificationFileSchema.parse(
      JSON.parse(readFileSync(verificationPath, "utf8")),
    );
    return {
      entries: parsed.entries,
      validatorVersion: parsed.validator_version,
    };
  } catch (error) {
    throw new Error(`data/verification.json: ${errorMessage(error)}`);
  }
}

function readEntryFile(file: string): Entry {
  const path = join(entriesDir, file);
  const size = statSync(path).size;
  if (size > MAX_ENTRY_BYTES) {
    throw new Error(`${file}: exceeds the 16 KiB entry limit`);
  }

  let data: unknown;
  try {
    data = parse(readFileSync(path, "utf8"), { maxAliasCount: 0 });
  } catch (error) {
    throw new Error(`${file}: ${errorMessage(error)}`);
  }

  try {
    const entry = entrySchema.parse(data);
    if (`${entry.slug}.yaml` !== file && `${entry.slug}.yml` !== file) {
      throw new Error("slug must match the filename");
    }
    return entry;
  } catch (error) {
    throw new Error(`${file}: ${errorMessage(error)}`);
  }
}

export function getEntries(): ProviderEntry[] {
  const files = readdirSync(entriesDir)
    .filter((file) => file.endsWith(".yaml") || file.endsWith(".yml"))
    .sort();

  const verification = readVerification();
  const entries = files.map((file) => {
    const entry = readEntryFile(file);
    const record = verification.entries[entry.slug] ?? null;
    return {
      ...entry,
      verification: record,
      validatorVersion: verification.validatorVersion,
      status: record?.status ?? "unchecked",
    };
  });

  const slugs = new Set<string>();
  const names = new Set<string>();
  const sources = new Set<string>();

  for (const entry of entries) {
    if (slugs.has(entry.slug)) {
      throw new Error(`Duplicate slug: ${entry.slug}`);
    }
    slugs.add(entry.slug);

    const nameKey = entry.name.toLowerCase();
    if (names.has(nameKey)) {
      throw new Error(`Duplicate provider name: ${entry.name}`);
    }
    names.add(nameKey);

    if (sources.has(entry.discovery_url)) {
      throw new Error(`Duplicate discovery URL: ${entry.discovery_url}`);
    }
    sources.add(entry.discovery_url);
  }

  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

export function getActiveEntries(): ProviderEntry[] {
  return getEntries().filter((entry) => entry.status === "valid");
}

export function getEntry(slug: string): ProviderEntry | undefined {
  return getEntries().find((entry) => entry.slug === slug);
}
