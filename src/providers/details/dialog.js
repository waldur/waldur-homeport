import template from './dialog.html';

const providerDialog = {
  template: template,
  bindings: {
    dismiss: '&',
    close: '&',
    resolve: '<'
  },
  controller: class ProviderDialogController {
    // @ngInject
    constructor(ProviderUtilsService, $scope) {
      this.ProviderUtilsService = ProviderUtilsService;
      this.$scope = $scope;
    }

    $onInit() {
      this.editable = this.resolve.editable;
      this.loading = true;
      this.ProviderUtilsService.loadData(this.resolve)
        .then(({ provider, settings, settingsVisible }) => {
          this.provider = provider;
          this.settings = settings;
          this.settingsVisible = settingsVisible;
          this.loading = false;
          this.$scope.$digest();
        });
    }
  }
};

export default providerDialog;
