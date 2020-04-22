// @ngInject
export function checkPermission(usersService, $q) {
  return usersService.getCurrentUser().then(user => {
    if (!user.is_staff && !user.is_support) {
      return $q.reject();
    }
  });
}
