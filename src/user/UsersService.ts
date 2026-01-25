import {
  Options,
  User,
  usersMeRetrieve,
  UsersMeRetrieveData,
} from 'waldur-js-client';

import { getRoles } from '@waldur/administration/roles/utils';
import { getHeaders, initApiClient } from '@waldur/core/api';
import { ENV } from '@waldur/core/config';
import { ImpersonationStorage } from '@waldur/core/StorageManager';
import store from '@waldur/store/store';
import { getProfileCompleteness } from '@waldur/user/useProfileCompleteness';
import { setCurrentUser, setImpersonatorUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';

export const getCurrentUser = async (
  options?: Options<UsersMeRetrieveData>,
) => {
  const user = await usersMeRetrieve(options).then((response) => response.data);
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

  async refreshImpersonatorUser(options?: Options<UsersMeRetrieveData>) {
    if (ImpersonationStorage.get()) {
      const user = await getCurrentUser({
        ...options,
        headers: getHeaders(false),
      });
      store.dispatch(setImpersonatorUser(user));
    }
  }

  async refreshCurrentUser(options?: Options<UsersMeRetrieveData>) {
    const user = await getCurrentUser(options);
    store.dispatch(setCurrentUser(user));
    return user;
  }

  getCachedUser() {
    return getUser(store.getState());
  }

  isCurrentUserValid() {
    return this.getCurrentUser().then((user) => {
      return (
        user.is_staff ||
        (!this.mandatoryAttributesMissing(user) &&
          (user as User).agreement_date)
      );
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
