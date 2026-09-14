/**
 * The `call` param of the `proposals-call-proposals` route.
 *
 * Both halves live here because the bug they replace was the two sides
 * disagreeing about how many times the value is encoded.
 */

/** The slice of a call the proposals filter reads back. */
export interface CallFilterValue {
  uuid: string;
  name: string;
}

/**
 * Builds the param from a call.
 *
 * Only uuid and name — the only fields read back, by `selectProposalsFilter`
 * (`call_uuid`) and the filter chip (its label). A whole `PublicCall` carries
 * a description, offerings, rounds, documents and a field config, which
 * percent-encode into tens of kilobytes in a single path segment; nginx's
 * default 8 KB request-line cap turns that into a 414 on reload.
 */
export const buildCallFilterParam = (call: CallFilterValue): string =>
  JSON.stringify({ uuid: call.uuid, name: call.name });

/**
 * Reads the param back.
 *
 * No decoding: UI-Router percent-decodes a path param before handing it over
 * (the `path` param type is not `raw`, so `UrlMatcher.exec` decodes what
 * `format` encoded). Decoding a second time reads a literal '%' in the call's
 * own text as an escape sequence and throws "URI malformed".
 *
 * Returns undefined for anything that is not a call -- unparseable, or valid
 * JSON of the wrong shape -- so a mangled link costs the pre-filter, not the
 * page.
 */
export const parseCallFilterParam = (
  call: string | undefined,
): CallFilterValue | undefined => {
  if (!call) return undefined;

  let parsed: unknown;
  try {
    parsed = JSON.parse(call);
  } catch {
    return undefined;
  }

  // JSON.parse also accepts bare numbers, strings and arrays. One of those is
  // truthy enough to seed the filter while carrying no uuid, so the table would
  // drop the call scope and quietly list every proposal the user can read --
  // worse than the error this function replaced.
  const value = parsed as Partial<CallFilterValue> | null;
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof value.uuid !== 'string' ||
    typeof value.name !== 'string'
  ) {
    return undefined;
  }
  return value as CallFilterValue;
};
