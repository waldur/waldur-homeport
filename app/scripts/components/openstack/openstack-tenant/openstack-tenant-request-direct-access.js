import template from './openstack-tenant-request-direct-access.html';

// @ngInject
class DialogController {
  constructor(features, $uibModal, ISSUE_IDS, ENV) {
    this.features = features;
    this.$uibModal = $uibModal;
    this.ISSUE_IDS = ISSUE_IDS;
    this.ENV = ENV;
  }

  $onInit() {
    this.tenant = this.resolve.resource;
    this.loading = false;
    this.supportEmail = this.ENV.supportEmail;
    this.supportEnabled = this.features.isVisible('support');

    if (this.supportEnabled) {
      this.close();
      this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            type: this.ISSUE_IDS.SERVICE_REQUEST,
            summary: gettext('Request direct access to Open Stack Tenant'),
            resource: this.tenant,
          }),
          options: {
            title: gettext('Request direct access to Open Stack Tenant'),
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
