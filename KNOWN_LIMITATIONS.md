# Known limitations

1. **No public Claude Artifact JavaScript API is assumed.** The package requires a host-injected adapter named `window.__DISPATCH_MODEL_ADAPTER__`. A Claude-generated AI-powered Artifact must wire its platform-native model call to this interface.
2. **The local Vite app has no model access by default.** It can still test report logic and any compatible storage bridge.
3. **No browser API keys.** Direct calls to the public Anthropic Messages API were intentionally removed.
4. **Storage is runtime-dependent.** `window.storage` is tested only when all required methods exist.
5. **No quota bypass claim.** The project does not claim separate or free provider capacity.
6. **No cost or quality proof.** Passing capability checks does not prove token savings, lower cost, lower latency, or better answers.
7. **No production readiness.** The project is an experimental capability probe, not a distributed task system.
