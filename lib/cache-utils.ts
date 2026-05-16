/**
 * clearOfflineData
 * ----------------
 * Clears ALL client-side offline storage on any browser/device:
 *   1. Cache Storage API  (PWA caches)
 *   2. localStorage + sessionStorage
 *   3. IndexedDB databases
 *   4. Service Worker registrations
 *
 * Each step is isolated so a failure in one never blocks the others.
 * Returns a summary object so callers can show granular results if desired.
 */

export interface ClearResult {
  caches: boolean;
  storage: boolean;
  indexedDB: boolean;
  serviceWorkers: boolean;
}

async function clearIndexedDB(): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const databases = await indexedDB.databases().catch(() => [] as IDBDatabaseInfo[]);

  await Promise.all(
    databases.map(
      ({ name }) =>
        new Promise<void>((resolve) => {
          if (!name) return resolve();
          const req = indexedDB.deleteDatabase(name);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve(); // resolve so we don't block others
          req.onblocked = () => resolve();
        }),
    ),
  );
}

export async function clearOfflineData(options?: {
  reload?: boolean;
}): Promise<ClearResult> {
  const shouldReload = options?.reload ?? true;

  const result: ClearResult = {
    caches: false,
    storage: false,
    indexedDB: false,
    serviceWorkers: false,
  };

  if (typeof window === "undefined") return result;

  // 1. Cache Storage API
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    result.caches = true;
  } catch {
    // Non-fatal — continue clearing the rest.
  }

  // 2. localStorage & sessionStorage
  try {
    window.localStorage.clear();
    window.sessionStorage.clear();
    result.storage = true;
  } catch {
    // Restricted contexts (e.g., private browsing with strict settings).
  }

  // 3. IndexedDB
  try {
    await clearIndexedDB();
    result.indexedDB = true;
  } catch {
    // IDB may not be available or databases() may be unsupported.
  }

  // 4. Service Worker unregistration
  try {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));
    }
    result.serviceWorkers = true;
  } catch {
    // Ignore — the page reload will naturally handle stale workers.
  }

  if (shouldReload) {
    window.location.reload();
  }

  return result;
}
