import { User, UserMe, usersMeRetrieve } from 'waldur-js-client';

import { getRoles } from '@/administration/roles/utils';
import { getHeaders, initApiClient } from '@/core/api';
import { ENV } from '@/core/config';
import { ImpersonationStorage } from '@/core/StorageManager';
import store from '@/store/store';
import { getProfileCompleteness } from '@/user/useProfileCompleteness';
import { setCurrentUser, setImpersonatorUser } from '@/workspace/actions';
import { getUser } from '@/workspace/selectors';

export const getCurrentUser = async (
  options?: Parameters<typeof usersMeRetrieve>[0],
) => {
  // /users/me/ returns UserMe (a User plus profile_completeness, and a
  // `permissions: MePermission[]` shape). The app models the signed-in user as
  // `User`; the runtime object carries every field the app reads (including
  // profile_completeness, accessed via a cast in getProfileCompleteness), so
  // it is narrowed to `User` at this boundary. Widening the store to `UserMe`
  // app-wide is a separate, deployment-wide change.
  const user = await usersMeRetrieve(options).then(
    (response) => response.data as UserMe as unknown as User,
  );
  if (ENV.roles.length === 0) {
    ENV.roles = await getRoles();
  }
  return user;
};

export const setImpersonationData = (userUuid: string) => {
  ImpersonationStorage.set(userUuid);
  initApiClient();
};

export const clearImpersonationData = () => {
  ImpersonationStorage.remove();
  initApiClient();
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
    const user = await getCurrentUser(options);
    store.dispatch(setCurrentUser(user));
    return user;
  }

  getCachedUser() {
    return getUser(store.getState());
  }

  isCurrentUserValid() {
    return this.getCurrentUser().then((user) => {
      // Staff and support users are always valid
      if (user.is_staff || user.is_support) {
        return true;
      }
      // Frontend always enforces profile completeness (enforcement_enabled is for API only)
      const completeness = getProfileCompleteness(user);
      // Check profile completeness and agreement date
      return completeness.is_complete && Boolean((user as User).agreement_date);
    });
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
