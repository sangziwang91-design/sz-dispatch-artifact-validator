export function unavailableStorageAdapter(reason = "No compatible storage bridge was detected.") {
  return {
    name: "unavailable",
    available: false,
    reason,
    async set() { throw new Error(reason); },
    async get() { throw new Error(reason); },
    async delete() { throw new Error(reason); },
    async list() { throw new Error(reason); },
  };
}

export function windowStorageAdapter(runtime = globalThis) {
  const storage = runtime?.storage;
  const required = ["set", "get", "delete", "list"];
  if (!storage || !required.every((key) => typeof storage[key] === "function")) {
    return unavailableStorageAdapter();
  }
  return {
    name: "window.storage",
    available: true,
    async set(key, value) { return storage.set(key, value); },
    async get(key) { return storage.get(key); },
    async delete(key) { return storage.delete(key); },
    async list(prefix) { return storage.list(prefix); },
  };
}
