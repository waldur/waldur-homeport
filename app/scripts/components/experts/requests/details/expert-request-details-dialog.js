import template from './expert-request-details-dialog.html';

const expertRequestDetailsDialog = {
  template,
  bindings: {
    resolve: '<',
    dismiss: '&',
  },
  controller: class ExpertRequestDetailsDialogController {
    $onInit() {
      this.expertRequest = this.resolve.expertRequest;
      if (!this.expertRequest.type && this.resolve.requestType) {
        this.expertRequest.type = this.resolve.requestType;
      }
    }
  }
};

export default expertRequestDetailsDialog;
