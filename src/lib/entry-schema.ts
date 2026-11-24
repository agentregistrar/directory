import { z } from "zod";

export const SUPPORTED_PROTOCOL_VERSIONS = ["2.0"] as const;

const asciiText = /^[\x20-\x7E]+$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      url.username === "" &&
      url.password === "" &&
      url.hash === "" &&
      !/\s/.test(value)
    );
  } catch {
    return false;
  }
}

const httpsUrl = z
  .url()
  .refine(isHttpsUrl, "must be an absolute HTTPS URL with no userinfo or fragment");

const contact = z
  .string()
  .min(1)
  .refine(
    (value) => emailPattern.test(value) || isHttpsUrl(value),
    "contact must be an email address or an absolute HTTPS URL",
  );

const description = z
  .string()
  .min(40)
  .max(200)
  .regex(asciiText, "description must be ASCII")
  .refine((value) => !/https?:\/\/|www\./i.test(value), "description must not contain URLs")
  .refine((value) => !/[<>]/.test(value), "description must be plain text")
  .refine(
    (value) => !/[.!?]{2,}/.test(value),
    "description must not contain repeated punctuation",
  );

const slug = z
  .string()
  .max(64)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug must be lowercase letters, numbers, and single hyphens",
  );

const tags = z
  .array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/))
  .max(5)
  .default([]);

const protocolVersion = z.string().refine(
  (value) => (SUPPORTED_PROTOCOL_VERSIONS as readonly string[]).includes(value),
  `protocol_version must be one of: ${SUPPORTED_PROTOCOL_VERSIONS.join(", ")}`,
);

const addedAt = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "added_at must be an ISO date (YYYY-MM-DD)")
  .refine(
    (value) => value <= new Date().toISOString().slice(0, 10),
    "added_at must not be in the future",
  );

export const entrySchema = z
  .object({
    name: z.string().min(1).max(80).regex(asciiText, "name must be ASCII"),
    slug,
    description,
    url: httpsUrl,
    discovery_url: httpsUrl,
    repo_url: httpsUrl.optional(),
    contact,
    protocol_version: protocolVersion,
    tags,
    added_at: addedAt,
  })
  .strict()
  .superRefine((entry, ctx) => {
    let origin: string;
    try {
      origin = new URL(entry.url).origin;
    } catch {
      return;
    }

    const expected = `${origin}/.well-known/agent-signup.json`;
    if (entry.discovery_url !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["discovery_url"],
        message: `must be ${expected}`,
      });
    }
  });

export type Entry = z.infer<typeof entrySchema>;
