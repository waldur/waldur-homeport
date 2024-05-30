import Axios from 'axios';

import { ENV } from '@waldur/configs/default';
import { get, getById, patch } from '@waldur/core/api';
import store from '@waldur/store/store';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';
import { WorkspaceStorage } from '@waldur/workspace/WorkspaceStorage';

export const getCurrentUser = (config?) =>
  get<UserDetails>('/users/me/', config).then((response) => response.data);

export const setImpersonationData = (userUuid) => {
  Axios.defaults.headers['X-IMPERSONATED-USER-UUID'] = userUuid;
  WorkspaceStorage.setImpersonatedUserUuid(userUuid);
};
export const clearImpersonationData = () => {
  delete Axios.defaults.headers['X-IMPERSONATED-USER-UUID'];
  WorkspaceStorage.clearImpersonatedUserUuid();
};

class UsersServiceClass {
  get(userId) {
    return getById<UserDetails>('/users/', userId);
  }

  update(user) {
    return patch(`/users/${user.uuid}/`, user);
  }

  getCurrentUser(refetch = false) {
    const cached = this.getCachedUser();
    if (!refetch && cached) {
      return Promise.resolve(cached);
    }
    return getCurrentUser().then((user) => {
      const isImpersonated = Boolean(
        Axios.defaults.headers['X-IMPERSONATED-USER-UUID'],
      );
      store.dispatch(setCurrentUser(user, isImpersonated));
      return user;
    });
  }

  getCachedUser() {
    return getUser(store.getState());
  }

  isCurrentUserValid() {
    return this.getCurrentUser().then((user) => {
      return (
        !this.mandatoryFieldsMissing(user) &&
        (user as UserDetails).agreement_date
      );
    });
  }

  mandatoryFieldsMissing(user) {
    return ENV.plugins.WALDUR_CORE.USER_MANDATORY_FIELDS.reduce(
      (result, item) => result || !user[item],
      false,
    );
  }
}

export const UsersService = new UsersServiceClass();
