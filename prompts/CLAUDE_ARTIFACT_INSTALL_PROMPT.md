# Claude Artifact installation prompt

Use this prompt inside Claude after uploading the public ZIP.

```text
You are installing an experimental capability validator into a Claude AI-powered Artifact.

READ the uploaded project before changing it. The project deliberately removed direct browser calls to api.anthropic.com and contains no API key.

Goal:
Wire Claude's platform-native AI capability to the narrow adapter interface expected by the app:

window.__DISPATCH_MODEL_ADAPTER__ = {
  name: "claude-artifact-native",
  capabilities: { systemPrompt: <true only if actually supported>, tools: <true only if actually supported> },
  async invoke({ prompt, system, maxTokens }) {
    // Use the Artifact platform-native Claude invocation mechanism.
    // Return either a string or { text: string }.
  }
};

Hard constraints:
1. Do not call https://api.anthropic.com/v1/messages from browser code.
2. Do not request, store, expose, or embed an Anthropic API key.
3. Do not invent an undocumented JavaScript API. Use only the native mechanism available in the current Artifact build environment.
4. If the native mechanism is unavailable or cannot be identified, do not simulate success. Leave the adapter unavailable and report UNKNOWN.
5. Do not change the evidence model: PASS, FAIL, SKIP, and UNKNOWN must remain distinct.
6. Do not add MCP or Web Search until the one-call PONG probe passes.
7. Do not claim token savings, separate quota, or production readiness.
8. Preserve JSON export and report redaction.

Execution order:
READ → identify native capability → minimal wire-up → run PONG probe → inspect raw result → only then run full validator → publish Artifact → test storage → export report.

Acceptance criteria:
- Native PONG probe returns PONG through the actual host-native bridge;
- no public API endpoint or credential appears in the browser bundle;
- absent capabilities remain UNKNOWN/SKIP;
- the exported report states the exact runtime and claim ceiling;
- if PONG fails, stop and deliver the raw error without expanding the system.
```
