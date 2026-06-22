import { describe, expect, it } from "vitest";
import { deriveVerdict, STATUS } from "../src/core/report.js";
import { runCapabilityTests } from "../src/core/tests.js";

function createMemoryStorage() {
  const values = new Map();
  return {
    name: "memory",
    available: true,
    async set(key, value) { values.set(key, value); return { key }; },
    async get(key) { return values.has(key) ? { value: values.get(key) } : null; },
    async delete(key) { values.delete(key); return true; },
    async list(prefix) { return { keys: [...values.keys()].filter((key) => key.startsWith(prefix)) }; },
  };
}

function createMockModel() {
  return {
    name: "mock",
    available: true,
    capabilities: { systemPrompt: true, tools: false },
    async invoke({ prompt, system }) {
      if (system?.includes("VALIDATOR")) return { text: "VALIDATOR" };
      if (prompt.includes("PONG")) return { text: "PONG" };
      if (prompt.includes("JSON")) return { text: '{"status":"ok","value":42}' };
      if (prompt.includes("你好世界")) return { text: "你好世界" };
      const match = prompt.match(/exactly (R\d+|BRIDGE_OK)/);
      return { text: match?.[1] || "OK" };
    },
  };
}

describe("runtime capability suite", () => {
  it("passes the full mock path and cleans ephemeral storage", async () => {
    const model = createMockModel();
    const storage = createMemoryStorage();
    const results = await runCapabilityTests({ model, storage });
    expect(results.some((result) => result.status === STATUS.FAIL)).toBe(false);
    expect(results.find((result) => result.id === "I01")?.status).toBe(STATUS.PASS);
    expect(results.find((result) => result.id === "S99")?.status).toBe(STATUS.PASS);
    expect(deriveVerdict(results, { model: true, storage: true })).toBe("VIABLE");
  });

  it("marks an unavailable runtime as not tested, not blocked", async () => {
    const unavailable = { name: "none", available: false, reason: "missing" };
    const results = await runCapabilityTests({ model: unavailable, storage: unavailable });
    expect(results.filter((result) => result.status === STATUS.FAIL)).toHaveLength(0);
    expect(deriveVerdict(results, { model: false, storage: false })).toBe("NOT_TESTED");
  });
});
