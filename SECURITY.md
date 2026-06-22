# Security policy

## Never put secrets in the browser

Do not place API keys, bearer tokens, cookies, private connector credentials, or account identifiers in:

- source files;
- Vite environment variables exposed to the browser;
- issues or pull requests;
- copied validation reports;
- Artifact prompts.

This project intentionally does not call the public Anthropic Messages API from browser code.

## Supported model integration

Use only a host-native or server-side adapter that exposes the narrow interface documented in `INSTALL.md`. The adapter should return text and must keep credentials outside the browser.

## Reporting a vulnerability

Open a private security advisory in the GitHub repository. Do not publish credentials or exploit details in a public issue.
