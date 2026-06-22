import { useMemo, useRef, useState } from "react";
import { deriveVerdict, exportReport, summarize } from "../core/report.js";
import { runCapabilityTests } from "../core/tests.js";

const PHASES = ["PREFLIGHT", "MODEL", "CONCURRENCY", "STORAGE", "INTEGRATION", "CLEANUP"];

export default function DispatchCapabilityValidator({ modelAdapter, storageAdapter }) {
  const [status, setStatus] = useState("idle");
  const [results, setResults] = useState([]);
  const [elapsed, setElapsed] = useState(0);
  const stopRef = useRef(false);

  const capabilities = useMemo(() => ({
    model: Boolean(modelAdapter?.available),
    storage: Boolean(storageAdapter?.available),
  }), [modelAdapter?.available, storageAdapter?.available]);

  const verdict = deriveVerdict(results, capabilities);
  const summary = summarize(results);
  const report = exportReport({
    version: "sz-dispatch-artifact-validator-v0.3.0-experimental",
    environment: {
      model_adapter: modelAdapter?.name || "none",
      model_available: String(capabilities.model),
      storage_adapter: storageAdapter?.name || "none",
      storage_available: String(capabilities.storage),
      user_agent: navigator.userAgent,
    },
    results,
    verdict,
  });

  async function run() {
    const started = performance.now();
    stopRef.current = false;
    setStatus("running");
    setResults([]);
    await runCapabilityTests({
      model: modelAdapter,
      storage: storageAdapter,
      shouldStop: () => stopRef.current,
      onResult: (_result, next) => {
        setResults(next);
        setElapsed(Math.round(performance.now() - started));
      },
    });
    setElapsed(Math.round(performance.now() - started));
    setStatus("done");
  }

  function stop() {
    stopRef.current = true;
    setStatus("done");
  }

  async function copy() {
    await navigator.clipboard?.writeText(JSON.stringify(report, null, 2));
  }

  return (
    <section className="panel">
      <div className="eyebrow">Evidence-first runtime audit</div>
      <h2>Dispatch capability validator</h2>
      <p className="muted">
        Missing capabilities are marked UNKNOWN or SKIP, not counted as functional failures. Only checks that actually run can support a claim.
      </p>

      <div className="bridge-grid">
        <div className={`bridge ${capabilities.model ? "bridge-on" : "bridge-off"}`}>
          <strong>Model bridge</strong>
          <span>{capabilities.model ? modelAdapter.name : "Unavailable"}</span>
        </div>
        <div className={`bridge ${capabilities.storage ? "bridge-on" : "bridge-off"}`}>
          <strong>Storage bridge</strong>
          <span>{capabilities.storage ? storageAdapter.name : "Unavailable"}</span>
        </div>
      </div>

      <div className="actions">
        <button className="primary" onClick={run} disabled={status === "running"}>Run validator</button>
        {status === "running" && <button className="danger" onClick={stop}>Stop</button>}
        {results.length > 0 && <button className="secondary" onClick={copy}>Copy JSON</button>}
      </div>

      {results.length > 0 && (
        <div className="summary-row">
          <span>PASS {summary.pass}</span>
          <span>FAIL {summary.fail}</span>
          <span>SKIP {summary.skip}</span>
          <span>UNKNOWN {summary.unknown}</span>
          <span>{elapsed}ms</span>
        </div>
      )}

      {PHASES.map((phase) => {
        const phaseResults = results.filter((result) => result.phase === phase);
        if (phaseResults.length === 0) return null;
        return (
          <div className="phase" key={phase}>
            <h3>{phase}</h3>
            {phaseResults.map((result) => (
              <div className={`result result-${result.status.toLowerCase()}`} key={result.id}>
                <div className="result-head">
                  <code>{result.id}</code>
                  <strong>{result.name}</strong>
                  <span>{result.status}</span>
                </div>
                <div className="result-detail">{result.detail}</div>
              </div>
            ))}
          </div>
        );
      })}

      {status === "done" && (
        <div className={`verdict verdict-${verdict.toLowerCase()}`}>
          <strong>{verdict}</strong>
          <span>
            {verdict === "NOT_TESTED" && "No executable host capabilities were available."}
            {verdict === "BLOCKED" && "A declared required capability failed its core test."}
            {verdict === "PARTIAL" && "Some checks passed, but the full model + storage path is not verified."}
            {verdict === "VIABLE" && "Core model, concurrency, storage, and integration checks passed in this runtime."}
          </span>
        </div>
      )}
    </section>
  );
}
