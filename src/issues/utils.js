import { UsersService } from '@waldur/user/UsersService';

// @ngInject
export function checkPermission($q) {
  return UsersService.getCurrentUser().then((user) => {
    if (!user.is_staff && !user.is_support) {
      return $q.reject();
    }
  });
}
