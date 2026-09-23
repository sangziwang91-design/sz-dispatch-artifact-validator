# Validation report

Date: 2026-09-22  
Environment: GitHub-hosted Ubuntu, Node.js 24

## Commands

```bash
npm install --no-audit --no-fund
npm test
npm run build
```

## Result

- Unit and integration tests: **14/14 PASS** on the current dependency lock;
- `npm audit --audit-level=high`: **0 vulnerabilities**;
- Vite **8.3.0** production build: **PASS**;
- direct Anthropic Messages API call in executable source: absent;
- hard-coded provider model ID in executable source: absent;
- private v0.2 source: excluded;
- original first-run failure evidence: included only as a sanitized JSON summary.

## Coverage

The tests cover:

- report redaction, including common provider/GitHub/Slack/Bearer/password-secret credential shapes;
- PASS / FAIL / SKIP / UNKNOWN accounting;
- verdict derivation;
- injected model-adapter normalization;
- storage-adapter detection;
- full mock model + concurrency + storage + integration path;
- cleanup of ephemeral storage keys;
- unavailable-runtime behavior.

## Dependency remediation evidence

The previous lock resolved a Vite 5-era toolchain with six audited findings
(2 moderate, 4 high). The remediation candidate was generated on CI, then
validated with a clean install, full dependency audit, all 14 tests, and a
production build before its `package.json` and `package-lock.json` were promoted
to the PR branch. The final read-only CI repeated those checks against the
committed lock and passed.

Current validated dev toolchain: `vite ^8.3.0`,
`@vitejs/plugin-react ^6.1.1`, `vitest ^5.0.1`.

## Limit

This report is repository/CI evidence only. It does not validate a Claude host-native bridge, published Artifact storage, provider billing, token savings, answer quality, or production reliability.
