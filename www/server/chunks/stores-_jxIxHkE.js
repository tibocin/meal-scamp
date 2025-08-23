import { w as writable$1 } from './index-EszbxhfW.js';

var stores = {
  local: {},
  session: {}
};
function getStorage(type) {
  return type === "local" ? localStorage : sessionStorage;
}
function writable(key, initialValue, options) {
  console.warn("writable() has been deprecated. Please use persisted() instead.\n\nchange:\n\nimport { writable } from 'svelte-local-storage-store'\n\nto:\n\nimport { persisted } from 'svelte-local-storage-store'");
  return persisted(key, initialValue);
}
function persisted(key, initialValue, options) {
  var _a, _b;
  const serializer = (_a = void 0) != null ? _a : JSON;
  const storageType = (_b = void 0) != null ? _b : "local";
  const browser = typeof window !== "undefined" && typeof document !== "undefined";
  const storage = browser ? getStorage(storageType) : null;
  function updateStorage(key2, value) {
    storage == null ? void 0 : storage.setItem(key2, serializer.stringify(value));
  }
  if (!stores[storageType][key]) {
    const store = writable$1(initialValue, (set2) => {
      const json = storage == null ? void 0 : storage.getItem(key);
      if (json) {
        set2(serializer.parse(json));
      }
      if (browser && storageType == "local") {
        const handleStorage = (event) => {
          if (event.key === key)
            set2(event.newValue ? serializer.parse(event.newValue) : null);
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
      }
    });
    const { subscribe, set } = store;
    stores[storageType][key] = {
      set(value) {
        updateStorage(key, value);
        set(value);
      },
      update(callback) {
        return store.update((last) => {
          const value = callback(last);
          updateStorage(key, value);
          return value;
        });
      },
      subscribe
    };
  }
  return stores[storageType][key];
}
const meals = writable("meals-v1", []);
const plan = writable("plan-v1", {});
const punches = writable("punches-v1", {});
const workouts = writable("workouts-v1", {});
const goal = writable("goal-v1", { start: 175, target: 150, current: 175, startedAt: (/* @__PURE__ */ new Date()).toISOString() });
const pushover = writable("pushover-v1", { userKey: "", appToken: "", enabled: false });

export { pushover as a, punches as b, goal as g, meals as m, plan as p, workouts as w };
//# sourceMappingURL=stores-_jxIxHkE.js.map
