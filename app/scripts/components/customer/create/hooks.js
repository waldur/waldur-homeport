// @ngInject
export default function attachHooks($rootScope, $uibModal, ENV, usersService) {
  function openPrompt() {
    return $uibModal.open({
      component: 'customerCreatePrompt',
      size: 'lg',
    }).result;
  }

  function openDialog() {
    return $uibModal.open({
      component: 'customerCreateDialog',
      size: 'lg',
    }).result;
  }

  $rootScope.$on('userInitCompleted', () => {
    usersService.getCurrentUser().then(user => {
      if (user.is_staff || ENV.ownerCanManageCustomer) {
        openPrompt().then(openDialog);
      }
    });
  });
}
