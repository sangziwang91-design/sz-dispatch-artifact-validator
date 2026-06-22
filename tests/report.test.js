import { describe, expect, it } from "vitest";
import { deriveVerdict, exportReport, phaseRate, redactText, STATUS, summarize } from "../src/core/report.js";

describe("report utilities", () => {
  it("redacts credentials, email, and local paths", () => {
    const input = "api_key=secret-value user@example.com C:\\Users\\name\\secret.txt sk-abcdefghijklmnop";
    const output = redactText(input);
    expect(output).not.toContain("secret-value");
    expect(output).not.toContain("user@example.com");
    expect(output).not.toContain("C:\\Users");
    expect(output).not.toContain("sk-abcdefghijklmnop");
  });

  it("summarizes all statuses", () => {
    const results = [STATUS.PASS, STATUS.FAIL, STATUS.SKIP, STATUS.UNKNOWN].map((status) => ({ status }));
    expect(summarize(results)).toEqual({ total: 4, pass: 1, fail: 1, skip: 1, unknown: 1 });
  });

  it("returns null rate for unmeasured phases", () => {
    expect(phaseRate([{ phase: "MODEL", status: STATUS.SKIP }], "MODEL")).toBeNull();
  });

  it("does not label unavailable runtime as blocked", () => {
    const results = [{ phase: "PREFLIGHT", status: STATUS.UNKNOWN }];
    expect(deriveVerdict(results, { model: false, storage: false })).toBe("NOT_TESTED");
  });

  it("blocks on required failure", () => {
    const results = [{ phase: "MODEL", status: STATUS.FAIL, required: true }];
    expect(deriveVerdict(results, { model: true, storage: false })).toBe("BLOCKED");
  });

  it("marks partial when only model checks pass", () => {
    const results = [
      { phase: "MODEL", status: STATUS.PASS },
      { phase: "CONCURRENCY", status: STATUS.PASS },
      { phase: "STORAGE", status: STATUS.SKIP },
    ];
    expect(deriveVerdict(results, { model: true, storage: false })).toBe("PARTIAL");
  });

  it("marks viable only with full measured path", () => {
    const results = [
      { phase: "MODEL", status: STATUS.PASS },
      { phase: "CONCURRENCY", status: STATUS.PASS },
      { phase: "STORAGE", status: STATUS.PASS },
      { phase: "INTEGRATION", status: STATUS.PASS },
    ];
    expect(deriveVerdict(results, { model: true, storage: true })).toBe("VIABLE");
  });

  it("exports a claim ceiling", () => {
    const report = exportReport({ version: "test", environment: {}, results: [], verdict: "NOT_TESTED" });
    expect(report.claim_ceiling).toContain("does not prove");
  });
});
