# Agent Registrar Directory

Agent Registrar's public directory of services that let AI agents sign up. The repository is the database: one YAML file per provider. A pull request triggers CI, CI fetches the provider's live discovery document and runs the official Agent Identity Protocol validator, and a maintainer merges the listing. The site is a static Astro build.

This is Agent Registrar's directory. It lives in the `agentregistrar` GitHub org and is part of the Agent Registrar project. It does not pretend to be independent or neutral.

## Status

The repository is public. The site is not deployed and the domain `agentregistrar.directory` is not attached yet. Deployment and the domain are operator-controlled.

## Requirements

- Node.js 22.12 or newer
- pnpm 9.15.4

## Local development

```bash
pnpm install
pnpm verify --check
pnpm dev
```

`pnpm dev` regenerates the badges and starts Astro on `http://localhost:4321`.

## Commands

```bash
pnpm verify                        # validate all entries, do not write
pnpm verify --check                # alias for the read-only check
pnpm verify --write                # validate all entries and update data/verification.json
pnpm verify --entry <slug> --write # update one entry
pnpm build                         # generate badges and build the static site
pnpm typecheck                     # Astro and TypeScript checks
```

`pnpm verify` exits `0` when every entry passes, `1` when any entry fails, and `2` when the script cannot run. Writing is explicit so a local check cannot silently change the committed evidence.

## Add a provider

1. Copy the template in `CONTRIBUTING.md`.
2. Add `data/entries/<slug>.yaml`. The filename must match the slug.
3. Open a pull request.
4. CI runs the validator against your live `/.well-known/agent-signup.json`.
5. A maintainer reviews the entry, runs `pnpm verify --entry <slug> --write`, and merges.

Do not edit `data/verification.json` by hand. It is generated evidence.

## Site

The public routes are:

- `/` - home
- `/entries` - all providers
- `/p/<slug>` - provider page
- `/submit` - submission guide
- `/badge` - badge preview and snippets
- `/about` - ownership, check limits, removal, privacy
- `/entries.json`, `/llms.txt`, `/sitemap-index.xml`, `/robots.txt`

The badge is `Agent signup | Supported`. It is generated only for providers with a passing check.

## Deployment

Cloudflare Pages:

1. Create a Pages project connected to the `agentregistrar/directory` GitHub repository.
2. Build command: `pnpm build`
3. Output directory: `dist`
4. Node version: 22
5. Production branch: `main`

Environment variables:

- `PUBLIC_SITE_URL` - the canonical site URL. Before the domain is attached, use the Pages URL and set `PUBLIC_NOINDEX=true`. After the domain is attached, use `https://agentregistrar.directory` and remove the noindex.
- `PUBLIC_NOINDEX=true` on preview deployments. Every page gets `noindex`, and `robots.txt` disallows all.
- `PUBLIC_CF_ANALYTICS_TOKEN` - optional, public Cloudflare Web Analytics token.

The domain is attached at public launch. Until then, use a Pages URL with `PUBLIC_NOINDEX=true` and do not submit it to search engines.

The scaffold ships `public/og.svg` as the Open Graph image. Replace it with a 1200x630 PNG before public launch; social platforms do not reliably render SVG.

## Data and license

- Code: Apache-2.0. See `LICENSE`.
- Directory data and site copy: CC BY 4.0. See `LICENSE-DATA`.
- Provider names and trademarks belong to their owners. No logos in this version.

## Security

See `SECURITY.md`. Do not open a public issue for a vulnerability.
