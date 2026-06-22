export const STATUS = Object.freeze({
  PASS: "PASS",
  FAIL: "FAIL",
  SKIP: "SKIP",
  UNKNOWN: "UNKNOWN",
});

const TOKEN_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{12,}\b/g,
  /\b(api[_-]?key|token|authorization)\s*[:=]\s*[^\s,;]+/gi,
  /Bearer\s+[A-Za-z0-9._~+\/-]+=*/gi,
];

const PATH_PATTERNS = [
  /[A-Za-z]:\\(?:[^\s"']+\\)*[^\s"']*/g,
  /\/(?:Users|home)\/[^\s"']+/g,
];

export function redactText(value) {
  let text = String(value ?? "");
  for (const pattern of TOKEN_PATTERNS) text = text.replace(pattern, "[REDACTED_CREDENTIAL]");
  for (const pattern of PATH_PATTERNS) text = text.replace(pattern, "[REDACTED_LOCAL_PATH]");
  text = text.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED_EMAIL]");
  return text.slice(0, 1000);
}

export function summarize(results) {
  return results.reduce(
    (acc, result) => {
      acc.total += 1;
      const key = String(result.status || STATUS.UNKNOWN).toLowerCase();
      if (Object.hasOwn(acc, key)) acc[key] += 1;
      return acc;
    },
    { total: 0, pass: 0, fail: 0, skip: 0, unknown: 0 },
  );
}

export function phaseRate(results, phase) {
  const measured = results.filter(
    (result) => result.phase === phase && [STATUS.PASS, STATUS.FAIL].includes(result.status),
  );
  if (measured.length === 0) return null;
  return Math.round((100 * measured.filter((result) => result.status === STATUS.PASS).length) / measured.length);
}

export function deriveVerdict(results, capabilities = {}) {
  const measured = results.filter((result) => [STATUS.PASS, STATUS.FAIL].includes(result.status));
  if (measured.length === 0) return "NOT_TESTED";

  const failed = measured.filter((result) => result.status === STATUS.FAIL);
  const coreFailure = failed.some((result) => result.required === true);
  if (coreFailure) return "BLOCKED";

  const modelRate = phaseRate(results, "MODEL");
  const concurrencyRate = phaseRate(results, "CONCURRENCY");
  const storageRate = phaseRate(results, "STORAGE");
  const integrationRate = phaseRate(results, "INTEGRATION");

  const modelOk = capabilities.model && modelRate !== null && modelRate >= 80;
  const storageOk = capabilities.storage && storageRate !== null && storageRate >= 80;
  const concurrencyOk = capabilities.model && concurrencyRate !== null && concurrencyRate >= 67;
  const integrationOk = capabilities.model && capabilities.storage && integrationRate !== null && integrationRate >= 80;

  if (modelOk && storageOk && concurrencyOk && integrationOk) return "VIABLE";
  return "PARTIAL";
}

export function exportReport({ version, environment, results, verdict }) {
  return {
    version,
    timestamp: new Date().toISOString(),
    environment: Object.fromEntries(
      Object.entries(environment || {}).map(([key, value]) => [key, redactText(value)]),
    ),
    summary: summarize(results),
    verdict,
    results: results.map((result) => ({
      id: result.id,
      phase: result.phase,
      name: result.name,
      status: result.status,
      required: Boolean(result.required),
      detail: redactText(result.detail),
    })),
    claim_ceiling:
      "This report verifies only the checks that actually ran in the current runtime. It does not prove provider quota bypass, cost savings, quality gains, or production reliability.",
  };
}
