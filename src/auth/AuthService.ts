/**
 * Portable auth core, wired to homeport's router/store via
 * ./authCoreSetup and re-exported here so existing import paths
 * (@/auth/AuthService) don't need to change. See ../core/authCoreSetup.ts
 * for the router/store wiring and ./authNavigation.ts for the
 * homeport-specific navigation layer built on top of this module.
 */
export {
  exchangeToken,
  loginUser,
  isAuthenticated,
  signin,
  signinByToken,
  clearAuthTokens,
} from 'waldur-auth-core';
