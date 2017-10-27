import template from './appstore-providers-empty-message.html';

const appstoreProvidersEmptyMessage = {
  template: template,
  controller: class AppstoreProvidersEmptyMessageController {
    // @ngInject
    constructor($state, $stateParams, coreUtils, currentStateService, AppStoreUtilsService) {
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.coreUtils = coreUtils;
      this.currentStateService = currentStateService;
      this.AppStoreUtilsService = AppStoreUtilsService;
    }

    $onInit() {
      this.currentStateService.getCustomer().then(customer => {
        this.customer = customer;
        let category = this.$state.current.data.category || this.$stateParams.category;
        if (category) {
          category = this.AppStoreUtilsService.findCategory(category);
          if (!category) {
            return;
          }
          this.isVPC = category.key === 'vms' || category.key === 'storages';
          this.noProvidersMessage = this.coreUtils.templateFormatter(
            gettext('There are no {categoryLabel} providers available for the current project.'),
            { categoryLabel: category.label.toLowerCase() });
        }
      });
    }

    showServiceStoreDialog() {
      return this.AppStoreUtilsService.openDialog();
    }
  }
};

export default appstoreProvidersEmptyMessage;
