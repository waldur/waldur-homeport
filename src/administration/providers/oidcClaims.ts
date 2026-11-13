// Claims that describe the ID token itself rather than the user. The backend
// never offers them to attribute mapping, so they are not mapping choices.
// Must stay in sync with ID_TOKEN_PROTOCOL_CLAIMS in waldur-mastermind
// (waldur_auth_social/id_token.py).
export const ID_TOKEN_PROTOCOL_CLAIMS: ReadonlySet<string> = new Set([
  'iss',
  'aud',
  'exp',
  'iat',
  'nbf',
  'nonce',
  'at_hash',
  'c_hash',
  's_hash',
  'auth_time',
  'azp',
  'sid',
  'jti',
  'typ',
  'session_state',
  'uti',
  'rh',
  'aio',
  'ver',
]);

// Claims that look like an email but that the provider does not guarantee to
// be the user's address. Entra ID's preferred_username "could be an email
// address, phone number, or a generic username" and can change; upn and
// unique_name are sign-in names of the same kind.
const UNVERIFIED_EMAIL_CLAIMS: ReadonlySet<string> = new Set([
  'preferred_username',
  'upn',
  'unique_name',
]);

/** Whether a space-separated claim list for `email` uses an unverified claim. */
export const mapsEmailToUnverifiedClaim = (value: unknown): boolean =>
  typeof value === 'string' &&
  value.split(/\s+/).some((claim) => UNVERIFIED_EMAIL_CLAIMS.has(claim));
