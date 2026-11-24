import type { ProviderEntry } from "./entries";

export type EntryStatus = ProviderEntry["status"];

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Not checked";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not checked";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function statusLabel(status: EntryStatus): string {
  switch (status) {
    case "valid":
      return "Validated";
    case "failing":
      return "Check failing";
    default:
      return "Not checked";
  }
}

export function statusClass(status: EntryStatus): string {
  return `status-${status}`;
}

export function siteUrl(): string {
  const site = import.meta.env.SITE ?? "https://agentregistrar.directory";
  return String(site).replace(/\/$/, "");
}

export function checkedLabel(entry: ProviderEntry): string {
  return entry.verification?.checked_at
    ? `Checked ${formatDate(entry.verification.checked_at)}`
    : "Not yet checked";
}

export function contactHref(contact: string): string {
  return contact.includes("@") && !contact.startsWith("http")
    ? `mailto:${contact}`
    : contact;
}

export function truncate(value: string, max = 160): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max - 1)}...`;
}
