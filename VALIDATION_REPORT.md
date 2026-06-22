# Validation report

Date: 2026-06-22  
Environment: sandbox, Node.js 22.16.0, npm 10.9.2

## Commands

```bash
npm install --no-audit --no-fund
npm test
npm run build
```

## Result

- Unit and integration tests: 14/14 PASS at packaging baseline;
- Vite production build: PASS;
- direct Anthropic Messages API call in executable source: absent;
- hard-coded provider model ID in executable source: absent;
- private v0.2 source: excluded;
- original first-run failure evidence: included only as a sanitized JSON summary.

## Coverage

The tests cover:

- report redaction;
- PASS / FAIL / SKIP / UNKNOWN accounting;
- verdict derivation;
- injected model-adapter normalization;
- storage-adapter detection;
- full mock model + concurrency + storage + integration path;
- cleanup of ephemeral storage keys;
- unavailable-runtime behavior.

## Limit

This report is sandbox evidence only. It does not validate a Claude host-native bridge, published Artifact storage, provider billing, token savings, answer quality, or production reliability.
