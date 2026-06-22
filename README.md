# SZ Dispatch Artifact Validator

**Evidence-first capability probe for browser and Claude Artifact runtimes.**

This repository is the public, privacy-reviewed successor to a private `sz-dispatch-validator-v0.2.tsx` experiment. The original experiment correctly preserved a runtime failure but used a direct browser request path that was not appropriate for a Claude-powered Artifact.

The public version removes that path and adds:

- a provider-neutral host-injected model adapter;
- a minimal host-native PONG probe;
- explicit PASS / FAIL / SKIP / UNKNOWN states;
- ephemeral storage namespaces and cleanup;
- credential, email, and local-path redaction in exported reports;
- deterministic unit tests;
- a sanitized failure-evidence record;
- detailed local and Claude Artifact installation instructions.

## Why this exists

AI platforms expose increasingly complex combinations of model calls, tools, storage, and hosted interfaces. Users need a way to distinguish:

```text
feature description
≠ code exists
≠ current runtime can execute it
≠ real workload is reliable
```

This project tests the current runtime without turning missing capabilities into fake failures or fake successes.

## Important safety decision

The browser bundle does **not** call the public Anthropic Messages API and never asks for a provider API key. Model access must be supplied by a host-native bridge or a server-side adapter.

## Quick start

```bash
npm install
npm test
npm run build
npm run dev
```

See [INSTALL.md](INSTALL.md) for local use and Claude Artifact installation.

## Adapter contract

The optional host model bridge is injected before React mounts:

```js
window.__DISPATCH_MODEL_ADAPTER__ = {
  name: "host-native",
  capabilities: { systemPrompt: true, tools: false },
  async invoke({ prompt, system, maxTokens }) {
    return { text: "PONG" };
  }
};
```

Credentials must remain outside the browser.

## Evidence included

`evidence/run-2026-06-22-direct-api-blocked.sanitized.json` records the first blocked-path result. It supports only this conclusion:

> The tested direct browser request path did not return a usable response in that Artifact runtime.

It does not prove that Claude-powered Artifacts, concurrency, tools, or persistent storage are unavailable.

## Status meanings

- `PASS`: the check executed and met its acceptance condition;
- `FAIL`: the check executed and did not meet its acceptance condition;
- `SKIP`: a declared prerequisite was absent;
- `UNKNOWN`: the runtime did not expose enough evidence to test the claim.

## Claim ceiling

This project does not prove:

- provider quota bypass;
- free or separate compute;
- token or cost savings;
- answer-quality improvement;
- production reliability;
- availability of undocumented host interfaces.

Current status: **v0.3.0-experimental**.

## Official context

Anthropic describes AI-powered Artifacts as hosted prototypes that can use Claude capabilities, and states that Artifact behavior depends on the current Claude environment and account. The project therefore avoids inventing a universal browser API and requires the host environment to provide the bridge.

- Anthropic Help Center: Prototype AI-Powered Apps with Claude Artifacts
- Anthropic Help Center: What are Artifacts and how do I use them?

## License

MIT. See [LICENSE](LICENSE).

## Related project

The portable Python DAG dispatcher is published separately at:

`https://github.com/sangziwang91-design/sz-dispatch-core`

The two repositories have different evidence states: this repository probes a hosted Artifact runtime; the Python repository validates a portable mock-backed dispatch core.
