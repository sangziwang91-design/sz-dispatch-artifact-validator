export function unavailableModelAdapter(reason = "No host-native model bridge was injected.") {
  return {
    name: "unavailable",
    available: false,
    capabilities: { systemPrompt: false, tools: false },
    reason,
    async invoke() {
      throw new Error(reason);
    },
  };
}

export function injectedModelAdapter(candidate) {
  if (!candidate || typeof candidate.invoke !== "function") {
    return unavailableModelAdapter();
  }
  return {
    name: String(candidate.name || "host-injected"),
    available: true,
    capabilities: {
      systemPrompt: Boolean(candidate.capabilities?.systemPrompt),
      tools: Boolean(candidate.capabilities?.tools),
    },
    async invoke(request) {
      const result = await candidate.invoke({
        prompt: String(request.prompt || ""),
        system: request.system ? String(request.system) : undefined,
        maxTokens: Number(request.maxTokens || 128),
      });
      if (typeof result === "string") return { text: result, raw: result };
      if (result && typeof result.text === "string") return result;
      throw new Error("Host model adapter returned an unsupported response shape.");
    },
  };
}

export function getInjectedModelAdapter(runtime = globalThis) {
  return injectedModelAdapter(runtime?.__DISPATCH_MODEL_ADAPTER__);
}
