# Reviewing a submission

Use this checklist for every provider pull request.

## 1. CI

- [ ] The `validate` job passed.
- [ ] The `build` job passed.
- [ ] The validator result shows zero errors. Warnings are allowed and recorded.

If CI could not fetch the document because of bot protection, run the same command from another network and record the exact output. Do not mark an entry valid without a successful validator run.

## 2. Authorization

- [ ] The submitter is the owner, a maintainer, or an authorized representative.
- [ ] The PR template attestation is present.
- [ ] The contact is a role address or a public contact URL, not a personal address.

## 3. Quality

- [ ] The provider is real, publicly accessible, and not a placeholder.
- [ ] The homepage and terms link respond.
- [ ] The description is factual, ASCII, 40-200 characters, and free of unsupported claims.
- [ ] The entry is not a duplicate by slug, name, or discovery URL.
- [ ] The provider is not primarily malware, phishing, fraud, or illegal.
- [ ] The owner has not asked for removal.
- [ ] The entry does not imply endorsement, certification, or a "verified provider" status.

## 4. Record the check

Run:

```bash
pnpm verify --entry <slug> --write
```

Commit the updated `data/verification.json` to the PR branch. If the contributor did not allow edits from maintainers, apply the change on a branch in the main repo.

Do not hand-edit `data/verification.json`.

## 5. Merge

- [ ] The verification record is committed.
- [ ] The branch is up to date.
- [ ] The PR title is descriptive, for example `Add Example Service`.
- [ ] The pull request is merged with a normal merge or squash.

The site rebuilds after the merge.

## Slugs

Slugs are permanent so badges and backlinks do not break. A name change keeps the slug. If a slug must change, add a redirect and keep the old badge URL working for at least 90 days. Never reassign a removed slug to a different provider.

## Removal

See `REMOVAL.md`.
