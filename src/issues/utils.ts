import { UsersService } from '@waldur/user/UsersService';

export function checkPermission() {
  return UsersService.getCurrentUser().then((user) => {
    if (!user.is_staff && !user.is_support) {
      return Promise.reject();
    }
  });
}
