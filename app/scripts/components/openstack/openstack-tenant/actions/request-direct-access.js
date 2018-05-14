import template from './request-direct-access.html';

class DialogController {
  // @ngInject
  constructor(features, $uibModal, ISSUE_IDS, ENV) {
    this.features = features;
    this.$uibModal = $uibModal;
    this.ISSUE_IDS = ISSUE_IDS;
    this.ENV = ENV;
  }

  $onInit() {
    this.tenant = this.resolve.resource;
    this.supportEmail = this.ENV.supportEmail;
    let supportEnabled = this.features.isVisible('support');

    if (supportEnabled) {
      this.close();
      this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            type: this.ISSUE_IDS.SERVICE_REQUEST,
            summary: gettext('Request direct access to OpenStack Tenant'),
            resource: this.tenant,
          }),
          options: {
            title: gettext('Request direct access to OpenStack Tenant'),
            descriptionPlaceholder: gettext('Please provide a reason'),
            descriptionLabel: gettext('Description'),
            summaryLabel: gettext('Tenant name'),
            hideTitle: true,
          }
        }
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
  }
};

export default openstackTenantRequestDirectAccess;
