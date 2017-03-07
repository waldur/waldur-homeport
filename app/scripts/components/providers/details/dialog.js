import template from './dialog.html';

const providerDialog = {
  template: template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class ProviderDialogController {
    $onInit() {
      this.provider = this.resolve.provider;
    }
  }
};

export default providerDialog;
