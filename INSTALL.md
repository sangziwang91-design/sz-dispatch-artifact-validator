# Installation and use

## A. Local inspection and build

Requirements:

- Node.js 20 or newer;
- npm 10 or newer.

```bash
unzip sz-dispatch-artifact-validator-v0.3-public.zip
cd sz-dispatch-artifact-validator-v0.3-public
npm install
npm test
npm run build
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

Expected local behavior:

- the UI loads;
- the model bridge is `Unavailable` unless you inject one;
- missing capabilities are reported as `UNKNOWN` or `SKIP`;
- local absence of a model bridge is not a product failure.

## B. Inject a safe model adapter for development

The app reads one optional global:

```js
window.__DISPATCH_MODEL_ADAPTER__ = {
  name: "host-native",
  capabilities: {
    systemPrompt: true,
    tools: false
  },
  async invoke({ prompt, system, maxTokens }) {
    // Call a host-native bridge or your own server-side proxy here.
    // Never put provider credentials in browser code.
    return { text: "PONG" };
  }
};
```

The adapter must be injected before React mounts. It may return either a string or `{ text: string }`.

## C. Install as a Claude AI-powered Artifact

Do not paste a Claude API key into this project. Do not restore the removed `fetch("https://api.anthropic.com/v1/messages")` path.

1. Open Claude and enable AI-powered Artifacts if the feature is available for your account.
2. Start a new Artifact build conversation.
3. Upload this ZIP.
4. Paste the exact instruction from `prompts/CLAUDE_ARTIFACT_INSTALL_PROMPT.md`.
5. Require Claude to wire the platform-native model capability to `window.__DISPATCH_MODEL_ADAPTER__`.
6. Run only the `Native PONG probe` first.
7. Continue to the full validator only after PONG passes.
8. Publish the Artifact before treating persistent storage as testable.
9. Export the JSON report and preserve the raw failure state.

## D. Interpreting verdicts

- `NOT_TESTED`: no executable capability was available;
- `BLOCKED`: a capability was declared available but a required core test failed;
- `PARTIAL`: some capabilities passed, but the full path is incomplete;
- `VIABLE`: model, concurrency, storage, and integration checks passed in that runtime.

`VIABLE` is still not proof of cost savings, quality gains, quota bypass, or production reliability.
