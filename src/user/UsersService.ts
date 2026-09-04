import { User, UserMe, usersMeRetrieve } from 'waldur-js-client';

import { getRoles } from '@/administration/roles/utils';
import { getHeaders, initApiClient } from '@/core/api';
import { ENV } from '@/core/config';
import {
  AuthTokenExpiryStorage,
  ImpersonationStorage,
} from '@/core/StorageManager';
import store from '@/store/store';
import { getProfileCompleteness } from '@/user/useProfileCompleteness';
import { setCurrentUser, setImpersonatorUser } from '@/workspace/actions';
import { getUser } from '@/workspace/selectors';

// In-flight requests shared by concurrent callers. At boot the transition
// guard, the login hook and the layout all ask for the current user before the
// store has one; without this each of them fetched /users/me/ and crawled the
// whole paginated roles list on its own.
let rolesInFlight: Promise<void> | null = null;
let userInFlight: Promise<User> | null = null;

/** Forget any in-flight fetches — the next call starts fresh. */
export const resetUserCache = () => {
  rolesInFlight = null;
  userInFlight = null;
};

const ensureRoles = (): Promise<void> => {
  if (ENV.roles.length > 0) {
    return Promise.resolve();
  }
  if (!rolesInFlight) {
    const request = getRoles()
      .then((roles) => {
        ENV.roles = roles;
      })
      .finally(() => {
        if (rolesInFlight === request) {
          rolesInFlight = null;
        }
      });
    rolesInFlight = request;
  }
  return rolesInFlight;
};

/**
 * Remember when the stored token expires, so the pre-bundle redirect can treat
 * a stale token as no session and send the visitor straight to the identity
 * provider instead of booting the whole app to discover a 401.
 *
 * Only recorded when the value describes the token the browser actually holds:
 * while impersonating, /users/me/ answers for the impersonated account rather
 * than the token's owner, and in OIDC access-token mode the browser holds the
 * provider's token while this field still describes Waldur's own. In both
 * cases the key is dropped, and the boot script falls back to treating any
 * token as live.
 */
const recordTokenExpiry = (user: User) => {
  if (
    ImpersonationStorage.get() ||
    ENV.plugins?.WALDUR_CORE?.OIDC_ACCESS_TOKEN_ENABLED ||
    !user.token_expires_at
  ) {
    AuthTokenExpiryStorage.remove();
    return;
  }
  AuthTokenExpiryStorage.set(user.token_expires_at);
};

export const getCurrentUser = async (
  options?: Parameters<typeof usersMeRetrieve>[0],
) => {
  // /users/me/ returns UserMe (a User plus profile_completeness, and a
  // `permissions: MePermission[]` shape). The app models the signed-in user as
  // `User`; the runtime object carries every field the app reads (including
  // profile_completeness, accessed via a cast in getProfileCompleteness), so
  // it is narrowed to `User` at this boundary. Widening the store to `UserMe`
  // app-wide is a separate, deployment-wide change.
  //
  // Roles don't depend on the user, so both requests go out together.
  const [user] = await Promise.all([
    usersMeRetrieve(options).then(
      (response) => response.data as UserMe as unknown as User,
    ),
    ensureRoles(),
  ]);
  recordTokenExpiry(user);
  return user;
};

/**
 * Whether the user may use the application without first completing their
 * profile. Staff and support are always valid; everyone else needs a complete
 * profile and accepted terms. Frontend always enforces profile completeness
 * (enforcement_enabled is for API only).
 */
export const isUserValid = (user: User): boolean => {
  if (user.is_staff || user.is_support) {
    return true;
  }
  const completeness = getProfileCompleteness(user);
  return completeness.is_complete && Boolean(user.agreement_date);
};

// Both setters change the headers every request carries, so a /users/me/
// already in flight answers for the wrong identity and must not be shared.
export const setImpersonationData = (userUuid: string) => {
  ImpersonationStorage.set(userUuid);
  initApiClient();
  resetUserCache();
};

export const clearImpersonationData = () => {
  ImpersonationStorage.remove();
  initApiClient();
  resetUserCache();
  store.dispatch(setImpersonatorUser(null));
};

class UsersServiceClass {
  async getCurrentUser() {
    return this.getCachedUser() || (await this.refreshCurrentUser());
  }

  async refreshImpersonatorUser(
    options?: Parameters<typeof usersMeRetrieve>[0],
  ) {
    if (ImpersonationStorage.get()) {
      const user = await getCurrentUser({
        ...options,
        headers: getHeaders(false),
      });
      store.dispatch(setImpersonatorUser(user));
    }
  }

  async refreshCurrentUser(options?: Parameters<typeof usersMeRetrieve>[0]) {
    if (options) {
      // Custom headers (impersonation) must not share the plain request.
      const user = await getCurrentUser(options);
      store.dispatch(setCurrentUser(user));
      return user;
    }
    if (!userInFlight) {
      const request: Promise<User> = getCurrentUser()
        .then((user) => {
          // A request outlived by a reset (login, logout, impersonation)
          // belongs to a session that no longer exists; don't let its late
          // answer overwrite the user fetched after it.
          if (userInFlight === request) {
            store.dispatch(setCurrentUser(user));
          }
          return user;
        })
        .finally(() => {
          if (userInFlight === request) {
            userInFlight = null;
          }
        });
      userInFlight = request;
    }
    return userInFlight;
  }

  getCachedUser() {
    return getUser(store.getState());
  }

  isCurrentUserValid() {
    return this.getCurrentUser().then(isUserValid);
  }

  /**
   * Check if mandatory profile attributes are missing.
   * Uses profile_completeness from API if available, otherwise falls back to local calculation.
   */
  mandatoryAttributesMissing(user: User) {
    const completeness = getProfileCompleteness(user);
    return !completeness.is_complete;
  }

  /**
   * @deprecated Use mandatoryAttributesMissing instead
   * Check if legacy USER_MANDATORY_FIELDS are missing (for registration flow)
   */
  mandatoryFieldsMissing(user) {
    return ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.reduce(
      (result, item) => result || !user[item],
      false,
    );
  }
}

export const UsersService = new UsersServiceClass();
