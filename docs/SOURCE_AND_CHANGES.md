# Source and public transformation

This public package was derived from the private `sz-dispatch-validator-v0.2.tsx` source and its first runtime report.

## Preserved

- diagnostic-first execution;
- PASS / FAIL / SKIP separation;
- structured JSON export;
- concurrency and storage probes;
- failure-preserving behavior;
- explicit claim ceiling.

## Removed or replaced

- direct browser calls to `api.anthropic.com`;
- hard-coded provider model names;
- provider-specific MCP endpoints;
- private storage key prefixes;
- Notion and alphaXiv probes;
- raw environment data beyond what is needed for diagnosis;
- verdict thresholds based only on total pass counts.

## Added

- provider-neutral injected model adapter;
- minimal host-native PONG probe;
- UNKNOWN as a first-class state;
- ephemeral random storage namespaces and cleanup;
- report redaction for credentials, email addresses, and local paths;
- deterministic unit tests;
- local Vite build and installation instructions.

The original private source is intentionally not included in the public archive.
