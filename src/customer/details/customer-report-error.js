import template from './customer-report-error.html';

class DialogController {
  // @ngInject
  constructor(features, $uibModal, ISSUE_IDS, ENV, coreUtils) {
    this.features = features;
    this.$uibModal = $uibModal;
    this.ISSUE_IDS = ISSUE_IDS;
    this.ENV = ENV;
    this.coreUtils = coreUtils;
  }

  $onInit() {
    if (this.features.isVisible('support')) {
      this.close();
      this.$uibModal.open({
        component: 'issueCreateDialog',
        resolve: {
          issue: () => ({
            type: this.ISSUE_IDS.SERVICE_REQUEST,
            summary: gettext('Incorrect organization details'),
            customer: this.resolve.customer,
          })
        }
      });
    } else {
      const context = {supportEmail: this.ENV.supportEmail};
      this.message = this.coreUtils.templateFormatter(gettext('To correct details of your organization, please send an email to <a href="mailto:{supportEmail}">{supportEmail}</a> highlighting the errors in current details. Thank you!'), context);
    }
  }
}

const customerReportError = {
  template: template,
  controller: DialogController,
  bindings: {
    resolve: '<',
    dismiss: '&',
    close: '&',
  }
};

export default customerReportError;
