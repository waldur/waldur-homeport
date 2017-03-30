import template from './appstore-providers.html';

const appstoreProviders = {
  template: template,
  bindings: {
    appstore : '=',
    loading: '='
  },
  controller: class AppstoreProvidersController {
    constructor($state, $stateParams, AppStoreUtilsService, coreUtils) {
      // @ngInject
      this.$state = $state;
      this.$stateParams = $stateParams;
      this.AppStoreUtilsService = AppStoreUtilsService;
      this.coreUtils = coreUtils;
    }

    $onInit() {
      let category = this.$state.current.data.category || this.$stateParams.category;
      if (category) {
        category = this.AppStoreUtilsService.findOffering(category);
        this.noProvidersMessage = this.coreUtils.templateFormatter(gettext('There are no working {categoryLabel} providers available for the current project.'),
          { categoryLabel: category.label.toLowerCase() });
      }
    }
  }
};

export default appstoreProviders;
