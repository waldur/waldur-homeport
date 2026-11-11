import { clearAuthCache } from '@/auth/authNavigation';
import { RedirectStorage } from '@/core/StorageManager';
import { router } from '@/router';

/**
 * Leaves the portal for its sign-in page with a full reload, so that the
 * configuration and features the preset set are read again.
 */
export const reloadToLogin = () => {
  clearAuthCache();
  // The old session's 401s remembered the page it was on; the next user,
  // often a demo user without staff rights, must start from their own
  // landing page, and the sign-in page must not say the session expired.
  RedirectStorage.remove();
  window.location.assign(router.stateService.href('login', {}) || '/login/');
};

/** After a failed load: the page decides itself whether its session survived. */
export const reloadPortal = () => {
  window.location.reload();
};
