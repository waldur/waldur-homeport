import Axios from 'axios';

import { translate } from '@waldur/i18n';

export default class InvitationDialogService {
  // @ngInject
  constructor(
    ENV,
    $state,
    InvitationPolicyService,
    invitationService,
    ncUtilsFlash,
  ) {
    this.ENV = ENV;
    this.$state = $state;
    this.InvitationPolicyService = InvitationPolicyService;
    this.invitationService = invitationService;
    this.ncUtilsFlash = ncUtilsFlash;
  }

  getRoles(context) {
    const roles = [
      {
        field: 'customer_role',
        title: this.ENV.roles.owner,
        value: 'owner',
        icon: 'fa-sitemap',
      },
      {
        field: 'project_role',
        title: this.ENV.roles.manager,
        value: 'manager',
        icon: 'fa-users',
      },
      {
        field: 'project_role',
        title: this.ENV.roles.admin,
        value: 'admin',
        icon: 'fa-server',
      },
    ];
    return roles.filter(role =>
      this.InvitationPolicyService.canManageRole(context, role),
    );
  }

  createInvite(
    customer,
    project,
    email,
    civil_number,
    tax_number,
    user_details,
    role,
  ) {
    const invite = this.invitationService.$create();
    invite.link_template = this.getTemplateUrl();
    invite.email = email;
    invite.civil_number = civil_number;
    invite.tax_number = tax_number;
    if (role.field === 'customer_role') {
      invite.customer_role = role.value;
      invite.customer = customer.url;
    } else if (role.field === 'project_role') {
      invite.project_role = role.value;
      invite.project = project.url;
    }
    if (user_details) {
      angular.merge(invite, user_details);
    }
    return invite
      .$save()
      .then(response => {
        this.ncUtilsFlash.success(translate('Invitation has been created.'));
        return response;
      })
      .catch(response => {
        this.ncUtilsFlash.error(translate('Unable to create invitation.'));
        return response.data;
      });
  }

  getTemplateUrl() {
    const path = this.$state.href('invitation', { uuid: 'TEMPLATE' });
    return location.origin + '/' + path.replace('TEMPLATE', '{uuid}');
  }

  fetchUserDetails(civil_number, tax_number) {
    const params = {
      civil_number,
      tax_number,
    };
    const url = `${this.ENV.apiEndpoint}api-auth/bcc/user-details/`;
    return Axios.get(url, { params });
  }
}
