import { useMemo, useState } from "react";
import ArtifactNativeProbe from "./components/ArtifactNativeProbe.jsx";
import DispatchCapabilityValidator from "./components/DispatchCapabilityValidator.jsx";
import { getInjectedModelAdapter } from "./adapters/model.js";
import { windowStorageAdapter } from "./adapters/storage.js";
import "./styles.css";

export default function App() {
  const [view, setView] = useState("validator");
  const modelAdapter = useMemo(() => getInjectedModelAdapter(window), []);
  const storageAdapter = useMemo(() => windowStorageAdapter(window), []);

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <div className="eyebrow">v0.3.0-experimental</div>
          <h1>SZ Dispatch Artifact Validator</h1>
          <p>
            A provider-neutral runtime capability probe. No browser API keys, no quota-bypass claim, and no fake success when the host bridge is absent.
          </p>
        </div>
      </header>

      <nav className="tabs" aria-label="Validator views">
        <button className={view === "validator" ? "active" : ""} onClick={() => setView("validator")}>Full validator</button>
        <button className={view === "probe" ? "active" : ""} onClick={() => setView("probe")}>Native PONG probe</button>
      </nav>

      {view === "validator" ? (
        <DispatchCapabilityValidator modelAdapter={modelAdapter} storageAdapter={storageAdapter} />
      ) : (
        <ArtifactNativeProbe modelAdapter={modelAdapter} />
      )}

      <footer>
        Current claim ceiling: this app verifies only checks that actually execute in the current runtime.
      </footer>
    </main>
  );
}
