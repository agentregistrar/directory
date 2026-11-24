import { getActiveEntries } from "../lib/entries";

export const prerender = true;

export async function GET() {
  const site = String(
    import.meta.env.SITE ?? "https://agentregistrar.directory",
  ).replace(/\/$/, "");
  const entries = getActiveEntries();

  const lines = [
    "# Agent Registrar Directory",
    "",
    "> Agent Registrar's public directory of services that support the Agent Identity Protocol. Every provider listing is checked against a live discovery document.",
    "",
    "## Directory",
    `- [All providers](${site}/entries)`,
    `- [Submit a provider](${site}/submit)`,
    `- [Badge](${site}/badge)`,
    "",
    "## Providers",
    ...entries.map(
      (entry) => `- [${entry.name}](${site}/p/${entry.slug}): ${entry.description}`,
    ),
    "",
    "## About",
    `- [What this is](${site}/about)`,
    "- [Agent Identity Protocol](https://docs.agentregistrar.dev/protocol/specification/)",
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
