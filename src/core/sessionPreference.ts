/**
 * A preference kept in session storage: it survives a reload of the tab, not
 * a new tab or a new session. Storage can be unavailable (private windows,
 * blocked site data); the preference then lasts until the reload, as before.
 */
export const readSessionPreference = <T>(key: string): T | undefined => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw === null ? undefined : (JSON.parse(raw) as T);
  } catch {
    return undefined;
  }
};

export const writeSessionPreference = (key: string, value: unknown) => {
  try {
    if (value === undefined || value === null) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  } catch {
    // Not kept across the reload; it holds until then.
  }
};
