// @ngInject
export default function InvitationDialogService(
  ENV,
  $state,
  InvitationPolicyService,
  invitationService,
  ncUtilsFlash) {

  return {
    getRoles,
    createInvite,
  };

  function getRoles(context) {
    const roles = [
      {
        field: 'customer_role',
        title: ENV.roles.owner,
        value: 'owner',
        icon: 'fa-sitemap'
      },
      {
        field: 'project_role',
        title: ENV.roles.manager,
        value: 'manager',
        icon: 'fa-users'
      },
      {
        field: 'project_role',
        title: ENV.roles.admin,
        value: 'admin',
        icon: 'fa-server'
      }
    ];
    return roles.filter(role => InvitationPolicyService.canManageRole(context, role));
  }

  function createInvite(customer, project, email, civil_number, role) {
    let invite = invitationService.$create();
    invite.link_template = getTemplateUrl();
    invite.email = email;
    invite.civil_number = civil_number;
    if (role.field === 'customer_role') {
      invite.customer_role = role.value;
      invite.customer = customer.url;
    } else if (role.field === 'project_role') {
      invite.project_role = role.value;
      invite.project = project.url;
    }
    return invite.$save()
      .then(response => {
        ncUtilsFlash.success(gettext('Invitation has been created.'));
        return response;
      })
      .catch(response => {
        ncUtilsFlash.error(gettext('Unable to create invitation.'));
        return response.data;
      });
  }

  function getTemplateUrl() {
    let path = $state.href('invitation', {uuid: 'TEMPLATE'});
    return location.origin + '/' + path.replace('TEMPLATE', '{uuid}');
  }
}
