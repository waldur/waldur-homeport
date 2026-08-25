import { StorageAdapter } from 'waldur-auth-core';

/**
 * Reads/writes the exact keys waldur-homeport's own
 * src/core/StorageManager.ts uses — NOT namespaced per micro-app. A user
 * already logged into the root app shouldn't have to log in again just
 * because they're now on a micro-app subpath, and a theme/language choice
 * made in one place should carry over to the other. Since every micro-app
 * is served from the same origin (see docs/micro-apps.md), reading the
 * same localStorage keys the root app already wrote to is enough — no
 * token hand-off or cross-app sync mechanism needed.
 */
export function createSharedStorage(key: string): StorageAdapter {
  const sharedKey = `waldur/${key}`;
  return {
    get: () => localStorage.getItem(sharedKey),
    set: (next) => localStorage.setItem(sharedKey, next),
    remove: () => localStorage.removeItem(sharedKey),
  };
}
