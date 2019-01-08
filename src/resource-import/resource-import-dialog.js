import template from './resource-import-dialog.html';

const resourceImportDialog = {
  template,
  bindings: {
    close: '&',
    dismiss: '&',
    resolve: '<',
  },
  controller: class ResourceImportDialog {
    // @ngInject
    constructor(
      $state,
      $rootScope,
      $scope,
      ncUtilsFlash,
      WorkspaceService,
      AppstoreProvidersService,
      currentStateService,
      CategoriesService) {
      this.$state = $state;
      this.$rootScope = $rootScope;
      this.$scope = $scope;
      this.ncUtilsFlash = ncUtilsFlash;
      this.WorkspaceService = WorkspaceService;
      this.AppstoreProvidersService = AppstoreProvidersService;
      this.CategoriesService = CategoriesService;
      this.currentStateService = currentStateService;
    }

    $onInit() {
      this.loadingProviders = true;
      this.selectedItems = [];
      this.service = this.resolve.service;
      this.service.clearAllCacheForCurrentEndpoint();
      this.componentTemplate = this.resolve.componentTemplate;
      this.selectProviderTitle = gettext('Step 1. Select provider');
      this.loadProviders().then(providers => {
        if (this.service.getSupported) {
          providers = this.service.getSupported(this.resolve.category, providers);
        }

        this.providers = providers;
      }).finally(() => this.loadingProviders = false);
      this.unlisten = this.$rootScope.$on('selectedItemsChanged', this.onSelectedItemsChanged.bind(this));
    }

    $onDestroy() {
      this.unlisten();
    }

    onSelectedItemsChanged(event, args) {
      this.selectedItems = args.data;
      this.hasItems = this.selectedItems.length > 0;
      this.$scope.$evalAsync();
    }

    importResources() {
      if(!this.hasItems) {
        return;
      }

      return this.service.importResources(this.selectedProvider, this.selectedItems).then(() => {
        this.ncUtilsFlash.success(gettext('Resources import has been initiated'));
        this.close();
      }).catch(response => {
        this.ncUtilsFlash.errorFromResponse(response, gettext('Resources could not be imported'));
      });
    }

    setProvider(service) {
      this.selectedProvider = service;
      this.$rootScope.$broadcast('providerChanged', {data: service});
    }

    loadProviders() {
      return this.currentStateService.getProject().then(project => {
        return this.AppstoreProvidersService.loadServices(project).then(project => {
          let categories = this.CategoriesService.getResourceCategories();
          // Volumes and storages are treated the same way for the moment.
          const key = this.resolve.category === 'volumes' ? 'storages' : this.resolve.category;
          let selectedCategory = categories.filter(category => category.key === key)[0];
          return project.services.filter(provider => selectedCategory.services.indexOf(provider.type) !== -1);
        });
      });
    }
  }
};

export default resourceImportDialog;
