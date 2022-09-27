import { UsersService } from '@waldur/user/UsersService';

export function hasPermission() {
  return UsersService.getCurrentUser().then((user) => {
    return user.is_staff || user.is_support;
  });
}

export function checkPermission() {
  return hasPermission().then((has) => {
    if (!has) {
      return Promise.reject();
    }
  });
}
