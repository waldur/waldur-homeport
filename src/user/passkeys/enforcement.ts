import { ENV } from '@/core/config';

/**
 * Whether this deployment requires staff and support accounts to hold a
 * passkey.
 *
 * Separate from whether passkeys are *available*: a deployment can offer them
 * to everyone without requiring them of anyone, and the two settings are read
 * independently so neither implies the other.
 *
 * Not exported — only needsPasskeyEnrollment asks this, and an unused export
 * is one knip rightly complains about.
 */
const arePasskeysEnforcedForStaff = (): boolean =>
  Boolean(ENV.plugins.WALDUR_CORE.PASSKEY_ENFORCED_FOR_STAFF);

/**
 * Whether this particular user is being held to that requirement and has not
 * yet met it.
 *
 * Enforcement covers support as well as staff, because both reach the Django
 * admin and are privileged in practice.
 */
export const needsPasskeyEnrollment = (user): boolean => {
  if (!user || !arePasskeysEnforcedForStaff()) {
    return false;
  }
  if (!(user.is_staff || user.is_support)) {
    return false;
  }
  return !user.has_passkey;
};
