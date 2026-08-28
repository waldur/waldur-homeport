import { ENV } from '@/core/config';

/**
 * Whether either passkey flow is switched on for this deployment.
 *
 * Everything passkey-related is hidden when it is not — an empty section is
 * worse than no section.
 */
export const arePasskeysEnabled = (): boolean => {
  const methods = ENV.plugins.WALDUR_CORE.AUTHENTICATION_METHODS ?? [];
  return methods.includes('PASSKEY_SIGNIN') || methods.includes('PASSKEY_MFA');
};
