import { ENV } from '@waldur/configs/default';
import { get, getById, patch } from '@waldur/core/api';
import store from '@waldur/store/store';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

export const getCurrentUser = (config?) =>
  get<UserDetails>('/users/me/', config).then((response) => response.data);

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
      store.dispatch(setCurrentUser(user));
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
