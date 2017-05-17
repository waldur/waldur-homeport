// @ngInject
class DialogController {
  constructor(features, $uibModal, ISSUE_IDS) {
    this.features = features;
    this.$uibModal = $uibModal;
    this.ISSUE_IDS = ISSUE_IDS;
  }

  $onInit() {
    if (this.features.isVisible('support')) {
      this.close();
      this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            type: this.ISSUE_IDS.SERVICE_REQUEST,
            summary: gettext('Request direct access to OpenStack Tenant'),
            resource: this.resolve.resource,
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
  controller: DialogController,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  }
};

export default openstackTenantRequestDirectAccess;
