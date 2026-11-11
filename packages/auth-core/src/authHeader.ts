import { getAuthCoreConfig } from './config';

// Methods whose token is a DRF Token issued by Waldur itself, rather than an
// OIDC access token. A passkey login yields exactly the same DRF token as a
// password login, so it belongs here — without it, a passkey session on an
// OIDC-enabled deployment would send `Bearer <drf-token>` and 401 on every
// request after login.
const DRF_TOKEN_METHODS = ['local', 'passkey'];

const getAuthPrefix = (): 'Token' | 'Bearer' => {
  const config = getAuthCoreConfig();
  if (DRF_TOKEN_METHODS.includes(config.storage.method.get())) {
    return 'Token';
  }
  return config.isOidcAccessTokenEnabled() ? 'Bearer' : 'Token';
};

/** The Authorization header for the current session, if there is one. */
export const getAuthHeader = () => {
  const config = getAuthCoreConfig();
  const token = config.storage.token.get();
  const prefix = getAuthPrefix();
  if (token) {
    return [prefix, token].join(' ');
  }
};
