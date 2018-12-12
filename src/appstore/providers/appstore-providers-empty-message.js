import template from './appstore-providers-empty-message.html';

const appstoreProvidersEmptyMessage = {
  template: template,
  controller: class AppstoreProvidersEmptyMessageController {
    // @ngInject
    constructor($state, $stateParams, coreUtils, currentStateService, usersService, ENV, AppStoreUtilsService) {
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.coreUtils = coreUtils;
      this.currentStateService = currentStateService;
      this.usersService = usersService;
      this.ENV = ENV;
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

    get canCreateProvider() {
      if (this.ENV.plugins.WALDUR_CORE.ONLY_STAFF_MANAGES_SERVICES && !this.usersService.currentUser.is_staff) {
        return false;
      }
      return true;
    }
  }
};

export default appstoreProvidersEmptyMessage;
