import { getFirst, getById, patch } from '@waldur/core/api';
import { ENV, $q } from '@waldur/core/services';
import store from '@waldur/store/store';
import { setCurrentUser } from '@waldur/workspace/actions';
import { getUser } from '@waldur/workspace/selectors';
import { UserDetails } from '@waldur/workspace/types';

export const getCurrentUser = () =>
  getFirst<UserDetails>('/users/', { current: '' });

class UsersServiceClass {
  get(userId) {
    return $q.when(getById<UserDetails>('/users/', userId));
  }

  update(user) {
    return $q.when(patch(`/users/${user.uuid}/`, user));
  }

  getCurrentUser() {
    if (getUser(store.getState())) {
      return $q.when(getUser(store.getState()));
    }
    return $q.when(getCurrentUser()).then((user) => {
      store.dispatch(setCurrentUser(user));
      return user;
    });
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
    return ENV.userMandatoryFields.reduce(
      (result, item) => result || !user[item],
      false,
    );
  }
}

export const UsersService = new UsersServiceClass();
