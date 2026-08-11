/**
 * Reads the API origin injected into index.html's `<meta name="api-url">`
 * tag at container start (see docker/entrypoint.sh's `__API_URL__`
 * substitution). Returns the literal placeholder unsubstituted if the
 * container hasn't configured it yet — callers should treat that value as
 * "not configured".
 */
export function getApiUrlFromMeta(): string {
  return document.querySelector('meta[name="api-url"]').getAttribute('content');
}
