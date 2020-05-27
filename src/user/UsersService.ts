import { getFirst } from '@waldur/core/api';
import { $rootScope, ENV, $q } from '@waldur/core/services';

class UsersServiceClass {
  public currentUser;

  setCurrentUser(user) {
    // TODO: Migrate to Redux and make code DRY
    this.currentUser = user;
    return $rootScope.$broadcast('CURRENT_USER_UPDATED', { user });
  }

  resetCurrentUser() {
    this.currentUser = undefined;
  }

  getCurrentUser() {
    if (this.currentUser) {
      return $q.when(this.currentUser);
    }
    return $q.when(getFirst('/users/', { current: '' })).then(user => {
      this.setCurrentUser(user);
      return user;
    });
  }

  isCurrentUserValid() {
    return this.getCurrentUser().then(user => {
      return !this.mandatoryFieldsMissing(user) && user.agreement_date;
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
