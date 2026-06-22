import { describe, expect, it } from "vitest";
import { getInjectedModelAdapter, injectedModelAdapter } from "../src/adapters/model.js";
import { windowStorageAdapter } from "../src/adapters/storage.js";

describe("model adapters", () => {
  it("is unavailable without injection", () => {
    expect(getInjectedModelAdapter({}).available).toBe(false);
  });

  it("normalizes string model responses", async () => {
    const adapter = injectedModelAdapter({ invoke: async () => "PONG", name: "test" });
    expect((await adapter.invoke({ prompt: "x" })).text).toBe("PONG");
  });
});

describe("storage adapter", () => {
  it("is unavailable without all required methods", () => {
    expect(windowStorageAdapter({ storage: { get() {} } }).available).toBe(false);
  });

  it("adapts a complete storage bridge", () => {
    const storage = { set() {}, get() {}, delete() {}, list() {} };
    expect(windowStorageAdapter({ storage }).available).toBe(true);
  });
});
