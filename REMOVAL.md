# Removal policy

## Owner request

An owner can request removal at any time through the repository issue templates. Remove the entry at the next review, or immediately if the request is urgent.

## Failing checks

- The weekly revalidation marks a provider as failing when the discovery document no longer passes.
- A failing provider gets a 30-day grace period. The listing stays visible with a failing status and is not badge-eligible.
- If the provider is still failing after 30 days, remove the entry.

## Immediate removal

Remove immediately when the entry is:

- malicious, phishing, fraud, or illegal;
- impersonating another service;
- using a discovery document it does not control;
- the subject of a valid legal or trademark complaint;
- repeatedly submitted against the owner's wishes.

## How to remove

1. Delete `data/entries/<slug>.yaml`.
2. Run `pnpm verify --write` to drop the verification record.
3. Commit the change.
4. The next build removes the provider page and its badge files.
5. Do not reassign the slug to a different provider.

## Appeals

A removal can be appealed through a GitHub issue or the published contact. A maintainer reviews the appeal and records the decision in the issue.

## Badge

When a listing is removed or marked failing, the badge is no longer valid. The badge file stops resolving after the next build. The provider must remove the badge from its README. See `BADGE-TERMS.md`.
