# Security policy

## Reporting a vulnerability

Do not open a public issue for a vulnerability. Use GitHub's private vulnerability reporting for this repository.

Include:

- what you found;
- the affected page, endpoint, or workflow;
- steps to reproduce;
- the impact you believe it has.

## Scope

In scope:

- the static site and its build;
- the entry schema and verification script;
- the GitHub Actions workflows;
- the badge generation and badge serving path;
- injection or SSRF issues in the submission flow.

Out of scope:

- the security of listed providers;
- the Agent Identity Protocol specification itself (report to the `agentregistrar/spec` repository);
- denial-of-service against a listed provider;
- social engineering.

## Handling

A maintainer will acknowledge the report, investigate, and coordinate a fix and disclosure. Do not test against production data or other users' systems.

## Secrets

The validation job runs with `permissions: contents: read` and no secrets. Do not add secrets to the validation workflow. If a deployment token is needed, scope it to the Pages project and store it in GitHub Secrets.
