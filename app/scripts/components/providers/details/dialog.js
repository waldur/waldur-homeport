import template from './dialog.html';

const providerDialog = {
  template: template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class ProviderDialogController {
    constructor(joinService) {
      this.joinService = joinService;
      this.editable = this.resolve.editable;
    }

    $onInit() {
      if (this.resolve.provider_uuid) {
        this.loading = true;
        this.joinService.$get(this.resolve.provider_type, this.resolve.provider_uuid)
          .then(provider => this.provider = provider)
          .finally(() => this.loading = false);
      } else {
        this.provider = this.resolve.provider;
      }
    }
  }
};

export default providerDialog;
