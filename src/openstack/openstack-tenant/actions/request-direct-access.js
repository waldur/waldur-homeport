import { ISSUE_IDS } from '@waldur/issues/types/constants';

import template from './request-direct-access.html';

class DialogController {
  // @ngInject
  constructor(features, $uibModal, ENV) {
    this.features = features;
    this.$uibModal = $uibModal;
    this.ENV = ENV;
  }

  $onInit() {
    this.tenant = this.resolve.resource;
    this.supportEmail = this.ENV.supportEmail;
    const supportEnabled = this.features.isVisible('support');

    if (supportEnabled) {
      this.close();
      this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            type: ISSUE_IDS.SERVICE_REQUEST,
            summary: gettext('Request direct access to OpenStack Tenant'),
            resource: this.tenant,
          }),
          options: {
            title: gettext('Request direct access to OpenStack Tenant'),
            descriptionPlaceholder: gettext('Please provide a reason'),
            descriptionLabel: gettext('Description'),
            summaryLabel: gettext('Tenant name'),
            hideTitle: true,
          },
        },
      });
    }
  }
}

const openstackTenantRequestDirectAccess = {
  template: template,
  controller: DialogController,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  },
};

export default openstackTenantRequestDirectAccess;
