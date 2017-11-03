import template from './expert-request-details-dialog.html';

const expertRequestDetailsDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
  },
  controller: class ExpertRequestDetailsDialogController {
    $onInit() {
      this.expertRequest = {
        ...this.resolve.expertRequest,
        ...this.resolve.expertRequest.extra,
        type: this.resolve.expertRequest.type || this.resolve.requestType
      };
    }
  }
};

export default expertRequestDetailsDialog;
