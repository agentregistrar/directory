import { getActiveEntries } from "../lib/entries";

export const prerender = true;

export async function GET() {
  const site = String(
    import.meta.env.SITE ?? "https://agentregistrar.directory",
  ).replace(/\/$/, "");

  const entries = getActiveEntries().map((entry) => ({
    slug: entry.slug,
    name: entry.name,
    description: entry.description,
    url: entry.url,
    ...(entry.repo_url ? { repo_url: entry.repo_url } : {}),
    contact: entry.contact,
    source: entry.discovery_url,
    protocol_version: entry.protocol_version,
    status: entry.verification?.status ?? "unchecked",
    checked_at: entry.verification?.checked_at ?? null,
  }));

  const body = {
    schema_version: 1,
    directory: site,
    generated_at: new Date().toISOString(),
    count: entries.length,
    entries,
  };

  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
