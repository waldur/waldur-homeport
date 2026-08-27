export { configureAuthCore } from './config';
export type { AuthCoreConfig, StorageAdapter } from './config';

export {
  getAuthHeader,
  getHeaders,
  initApiClient,
  attachAuthHeader,
  resetAuthSessionTracking,
  handleUnauthorizedResponse,
  get,
  post,
} from './client';

export {
  exchangeToken,
  loginUser,
  isAuthenticated,
  signin,
  signinByToken,
  clearAuthTokens,
} from './authService';
export type { SigninResult } from './authService';
