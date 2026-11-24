# Contributing

Agent Registrar Directory lists services that let AI agents sign up under a verified human owner. A listing is one YAML file in a pull request.

## Before you submit

- Your service serves a conformant discovery document at `https://<your-origin>/.well-known/agent-signup.json`.
- `npx @agentregistrar/discovery validate https://<your-origin>/.well-known/agent-signup.json --json` reports `valid: true`.
- You are the owner, a maintainer, or an authorized representative of the service.
- The description is factual, ASCII, 40-200 characters, and free of marketing superlatives.
- The contact is a public contact URL or a role email address, not a personal address.
- You have read `REVIEWING.md`, `REMOVAL.md`, and `BADGE-TERMS.md`.

## One entry per pull request

Add one file at `data/entries/<slug>.yaml`. The filename must match the slug. Do not edit other entries, `data/verification.json`, scripts, or workflows in the same pull request.

Updates to an existing entry follow the same flow. Do not change the slug.

## Template

```yaml
name: Example Service
slug: example-service
description: A factual one or two sentence description of the service and how an agent signs up.
url: https://example.com
discovery_url: https://example.com/.well-known/agent-signup.json
contact: security@example.com
protocol_version: "2.0"
tags:
  - devtools
added_at: 2026-11-24
```

Optional fields:

- `repo_url` - an absolute HTTPS URL to a public repository or package page.
- `tags` - up to five lowercase slugs. Suggested values: `reference`, `cloud`, `devtools`, `database`, `observability`, `security`, `open-source`.

Field rules:

- `name`: 1-80 ASCII characters, unique.
- `slug`: lowercase letters, numbers, and single hyphens; max 64; must match the filename.
- `description`: 40-200 ASCII characters, no URLs, no HTML, no repeated punctuation.
- `url`: absolute HTTPS, no userinfo, no fragment.
- `discovery_url`: must be exactly `<url origin>/.well-known/agent-signup.json`.
- `contact`: email address or absolute HTTPS URL.
- `protocol_version`: currently `"2.0"`.
- `added_at`: ISO date (`YYYY-MM-DD`), not in the future.

## Pull request checklist

- [ ] One provider, one YAML file.
- [ ] The discovery document is live and passes the official validator.
- [ ] The description is factual, ASCII, and within the length limit.
- [ ] The contact is a role address or a contact URL.
- [ ] I am authorized to submit this provider.
- [ ] I have read the listing limits and the badge terms.
- [ ] Allow edits from maintainers is enabled.

## What happens next

CI validates the changed entry and posts the result. A maintainer reviews the entry, runs `pnpm verify --entry <slug> --write` to record the check, and merges. The site rebuilds, the provider page goes live, and the badge becomes available.

Listing is not an endorsement. See `/about` for the full limits.

## License

By submitting a pull request, you confirm that the information is accurate, that you are authorized to represent the provider, and that the entry is licensed under CC BY 4.0.
