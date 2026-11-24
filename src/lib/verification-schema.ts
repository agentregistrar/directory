import { z } from "zod";
import { isHttpsUrl } from "./entry-schema";

const httpsUrl = z
  .url()
  .refine(isHttpsUrl, "must be an absolute HTTPS URL with no userinfo or fragment");

export const verificationEntrySchema = z
  .object({
    status: z.enum(["valid", "failing"]),
    kind: z.literal("discovery"),
    source: httpsUrl,
    checked_at: z.iso.datetime(),
    protocol: z.string().nullable(),
    protocol_version: z.string().nullable(),
    audience: z.string().nullable(),
    provider_name: z.string().nullable().optional(),
    terms_url: httpsUrl.nullable().optional(),
    counts: z
      .object({
        passed: z.number().int().nonnegative(),
        failed: z.number().int().nonnegative(),
        warnings: z.number().int().nonnegative(),
      })
      .strict(),
    errors: z.array(z.string()),
    warnings: z.array(z.string()),
  })
  .strict();

export const verificationFileSchema = z
  .object({
    schema_version: z.literal(1),
    generated_at: z.iso.datetime(),
    validator_version: z.string().min(1),
    entries: z.record(z.string(), verificationEntrySchema),
  })
  .strict();

export type VerificationEntry = z.infer<typeof verificationEntrySchema>;
export type VerificationFile = z.infer<typeof verificationFileSchema>;
