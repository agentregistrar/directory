## Add a provider

- [ ] One provider, one YAML file at `data/entries/<slug>.yaml`.
- [ ] The filename matches the slug.
- [ ] `pnpm verify --entry <slug> --check` passes locally.
- [ ] The discovery document is live and public.
- [ ] The description is factual, ASCII, 40-200 characters, with no URLs or HTML.
- [ ] The contact is a role address or a public contact URL.
- [ ] I am the owner, a maintainer, or an authorized representative of this provider.
- [ ] I have read the listing limits in `/about` and the badge terms.
- [ ] Allow edits from maintainers is enabled.

I confirm that the information in this entry is accurate and that the entry is licensed under CC BY 4.0.

## Notes for the maintainer

- Do not edit `data/verification.json` in this PR unless you are recording the check.
- Run `pnpm verify --entry <slug> --write` before merging.
- Check the homepage, terms link, and the discovery document.
