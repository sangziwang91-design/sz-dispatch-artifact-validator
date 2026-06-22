import { STATUS } from "./report.js";

function pass(id, phase, name, detail, required = false) {
  return { id, phase, name, status: STATUS.PASS, detail, required };
}
function fail(id, phase, name, detail, required = false) {
  return { id, phase, name, status: STATUS.FAIL, detail, required };
}
function skip(id, phase, name, detail) {
  return { id, phase, name, status: STATUS.SKIP, detail, required: false };
}
function unknown(id, phase, name, detail) {
  return { id, phase, name, status: STATUS.UNKNOWN, detail, required: false };
}

function textOf(response) {
  if (typeof response === "string") return response;
  return String(response?.text ?? "");
}

async function measured(id, phase, name, fn, required = false) {
  const started = performance.now();
  try {
    const outcome = await fn();
    const elapsed = Math.round(performance.now() - started);
    return outcome.ok
      ? pass(id, phase, name, `${outcome.detail} · ${elapsed}ms`, required)
      : fail(id, phase, name, `${outcome.detail} · ${elapsed}ms`, required);
  } catch (error) {
    return fail(id, phase, name, `${error?.message || "Unknown error"}`, required);
  }
}

export async function runCapabilityTests({ model, storage, onResult = () => {}, shouldStop = () => false }) {
  const results = [];
  const emit = (result) => {
    results.push(result);
    onResult(result, [...results]);
  };

  emit(
    model.available
      ? pass("P00", "PREFLIGHT", "Model bridge detected", model.name, true)
      : unknown("P00", "PREFLIGHT", "Model bridge detected", model.reason),
  );
  emit(
    storage.available
      ? pass("P01", "PREFLIGHT", "Storage bridge detected", storage.name)
      : unknown("P01", "PREFLIGHT", "Storage bridge detected", storage.reason),
  );

  if (model.available) {
    const modelTests = [
      ["M01", "PONG echo", async () => {
        const value = textOf(await model.invoke({ prompt: "Reply with exactly PONG.", maxTokens: 16 }));
        return { ok: value.trim().includes("PONG"), detail: value.slice(0, 80) };
      }, true],
      ["M02", "JSON response", async () => {
        const value = textOf(await model.invoke({ prompt: 'Return only JSON: {"status":"ok","value":42}', maxTokens: 64 }));
        const clean = value.replace(/```json|```/gi, "").trim();
        const parsed = JSON.parse(clean);
        return { ok: parsed.status === "ok" && parsed.value === 42, detail: clean.slice(0, 80) };
      }],
      ["M03", "Chinese response", async () => {
        const value = textOf(await model.invoke({ prompt: "只回复：你好世界", maxTokens: 24 }));
        return { ok: value.includes("你好世界"), detail: value.slice(0, 80) };
      }],
    ];
    if (model.capabilities.systemPrompt) {
      modelTests.push(["M04", "System instruction", async () => {
        const value = textOf(await model.invoke({
          prompt: "State your role in one word.",
          system: "Your role is VALIDATOR. Reply with VALIDATOR.",
          maxTokens: 24,
        }));
        return { ok: value.toUpperCase().includes("VALIDATOR"), detail: value.slice(0, 80) };
      }]);
    } else {
      emit(skip("M04", "MODEL", "System instruction", "Adapter does not declare systemPrompt support."));
    }

    for (const [id, name, fn, required = false] of modelTests) {
      if (shouldStop()) return results;
      emit(await measured(id, "MODEL", name, fn, required));
    }

    const concurrencyCases = [2, 3, 5];
    for (const count of concurrencyCases) {
      if (shouldStop()) return results;
      emit(await measured(`C0${count}`, "CONCURRENCY", `${count}-way Promise.all`, async () => {
        const expected = Array.from({ length: count }, (_, index) => `R${index + 1}`);
        const values = await Promise.all(
          expected.map((label) => model.invoke({ prompt: `Reply with exactly ${label}.`, maxTokens: 12 })),
        );
        const texts = values.map(textOf);
        return {
          ok: texts.every((text, index) => text.includes(expected[index])),
          detail: texts.map((text) => text.slice(0, 20)).join(" | "),
        };
      }, count === 2));
    }
  } else {
    [
      ["M01", "PONG echo"], ["M02", "JSON response"], ["M03", "Chinese response"],
      ["M04", "System instruction"], ["C02", "2-way Promise.all"],
      ["C03", "3-way Promise.all"], ["C05", "5-way Promise.all"],
    ].forEach(([id, name]) => emit(skip(id, id.startsWith("C") ? "CONCURRENCY" : "MODEL", name, "Model bridge unavailable.")));
  }

  const prefix = `dispatch-validator-${crypto.randomUUID?.() || Date.now()}-`;
  if (storage.available) {
    const key = (name) => `${prefix}${name}`;
    const storageTests = [
      ["S01", "Set and get", async () => {
        await storage.set(key("basic"), "hello");
        const value = await storage.get(key("basic"));
        return { ok: value?.value === "hello", detail: String(value?.value ?? "null") };
      }, true],
      ["S02", "JSON round trip", async () => {
        await storage.set(key("json"), JSON.stringify({ a: 1, b: [2, 3] }));
        const value = await storage.get(key("json"));
        const parsed = JSON.parse(value.value);
        return { ok: parsed.a === 1 && parsed.b.length === 2, detail: "JSON parsed" };
      }],
      ["S03", "Overwrite", async () => {
        await storage.set(key("overwrite"), "one");
        await storage.set(key("overwrite"), "two");
        const value = await storage.get(key("overwrite"));
        return { ok: value?.value === "two", detail: String(value?.value ?? "null") };
      }],
      ["S04", "Delete and verify", async () => {
        await storage.set(key("delete"), "temporary");
        await storage.delete(key("delete"));
        const value = await storage.get(key("delete"));
        return { ok: value == null, detail: `deleted=${value == null}` };
      }],
      ["S05", "Concurrent writes", async () => {
        await Promise.all(Array.from({ length: 5 }, (_, index) => storage.set(key(`batch-${index}`), `v${index}`)));
        const values = await Promise.all(Array.from({ length: 5 }, (_, index) => storage.get(key(`batch-${index}`))));
        return { ok: values.every((value, index) => value?.value === `v${index}`), detail: "5 values checked" };
      }],
      ["S06", "Prefix list", async () => {
        const listed = await storage.list(prefix);
        return { ok: Array.isArray(listed?.keys) && listed.keys.length >= 1, detail: `${listed?.keys?.length || 0} keys` };
      }],
    ];

    for (const [id, name, fn, required = false] of storageTests) {
      if (shouldStop()) return results;
      emit(await measured(id, "STORAGE", name, fn, required));
    }
  } else {
    [["S01", "Set and get"], ["S02", "JSON round trip"], ["S03", "Overwrite"], ["S04", "Delete and verify"], ["S05", "Concurrent writes"], ["S06", "Prefix list"]]
      .forEach(([id, name]) => emit(skip(id, "STORAGE", name, "Storage bridge unavailable.")));
  }

  if (model.available && storage.available) {
    emit(await measured("I01", "INTEGRATION", "Model to storage round trip", async () => {
      const value = textOf(await model.invoke({ prompt: "Reply with exactly BRIDGE_OK.", maxTokens: 16 })).trim();
      await storage.set(`${prefix}integration`, value);
      const stored = await storage.get(`${prefix}integration`);
      return { ok: value.includes("BRIDGE_OK") && stored?.value === value, detail: `${value} stored=${stored?.value === value}` };
    }, true));
  } else {
    emit(skip("I01", "INTEGRATION", "Model to storage round trip", "Both bridges are required."));
  }

  if (storage.available) {
    try {
      const listed = await storage.list(prefix);
      await Promise.all((listed?.keys || []).map((entry) => storage.delete(entry)));
      const after = await storage.list(prefix);
      emit(
        (after?.keys?.length || 0) === 0
          ? pass("S99", "CLEANUP", "Ephemeral cleanup", "0 keys remain")
          : fail("S99", "CLEANUP", "Ephemeral cleanup", `${after?.keys?.length || 0} keys remain`),
      );
    } catch (error) {
      emit(fail("S99", "CLEANUP", "Ephemeral cleanup", error?.message || "Cleanup failed"));
    }
  } else {
    emit(skip("S99", "CLEANUP", "Ephemeral cleanup", "Storage bridge unavailable."));
  }

  return results;
}
