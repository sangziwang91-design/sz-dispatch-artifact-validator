import { useMemo, useState } from "react";
import { exportReport, STATUS } from "../core/report.js";

export default function ArtifactNativeProbe({ modelAdapter }) {
  const [state, setState] = useState("idle");
  const [detail, setDetail] = useState("");
  const available = Boolean(modelAdapter?.available);

  const report = useMemo(() => exportReport({
    version: "artifact-native-probe-v0.1",
    environment: { adapter: modelAdapter?.name || "none" },
    verdict: state === "pass" ? "BRIDGE_AVAILABLE" : state === "fail" ? "BRIDGE_FAILED" : "NOT_TESTED",
    results: [{
      id: "N01",
      phase: "NATIVE_BRIDGE",
      name: "PONG through host-native model bridge",
      status: state === "pass" ? STATUS.PASS : state === "fail" ? STATUS.FAIL : STATUS.UNKNOWN,
      required: true,
      detail: detail || (available ? "Ready to test." : "No host-native bridge was injected."),
    }],
  }), [available, detail, modelAdapter?.name, state]);

  async function run() {
    if (!available) {
      setState("fail");
      setDetail("No host-native model bridge was injected. Do not add a browser API key or call api.anthropic.com directly.");
      return;
    }
    setState("running");
    setDetail("Calling host-native bridge...");
    try {
      const response = await modelAdapter.invoke({ prompt: "Reply with exactly PONG.", maxTokens: 16 });
      const text = String(response?.text ?? response ?? "");
      const ok = text.trim().includes("PONG");
      setState(ok ? "pass" : "fail");
      setDetail(text.slice(0, 300));
    } catch (error) {
      setState("fail");
      setDetail(error?.message || "Unknown bridge error");
    }
  }

  async function copy() {
    await navigator.clipboard?.writeText(JSON.stringify(report, null, 2));
  }

  return (
    <section className="panel">
      <div className="eyebrow">Minimal probe</div>
      <h2>Host-native Claude bridge</h2>
      <p className="muted">
        This probe validates one thing only: whether the host injects a callable model bridge. It never embeds an API key and never calls the public Anthropic endpoint from the browser.
      </p>
      <div className={`status ${available ? "status-pass" : "status-unknown"}`}>
        Adapter: {available ? modelAdapter.name : "not detected"}
      </div>
      <button className="primary" onClick={run} disabled={state === "running"}>
        {state === "running" ? "Running..." : "Run PONG probe"}
      </button>
      {detail && <pre className="output">{detail}</pre>}
      <button className="secondary" onClick={copy}>Copy probe report</button>
    </section>
  );
}
