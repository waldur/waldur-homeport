// @ngInject
export default function InvitationCreateAction(customersService, $uibModal) {
  function checkPermission(context) {
    return !context.user.is_staff && !customersService.isOwner(context.customer, context.user);
  }

  return context => ({
    title: gettext('Invite user'),
    iconClass: 'fa fa-plus',
    callback: function() {
      $uibModal.open({
        component: 'invitationDialog',
        resolve: {
          context: () => context,
        }
      }).result.then(function() {
        context.resetCache();
      });
    },
    disabled: checkPermission(context),
    titleAttr: checkPermission(context) && gettext('Only customer owner or staff can invite users.')
  });
}
