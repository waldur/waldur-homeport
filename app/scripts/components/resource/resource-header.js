import template from './resource-header.html';

const resourceHeader = {
  template: template,
  controller: class ResourceHeaderController{
    constructor(
      $stateParams,
      $state,
      $scope,
      $interval,
      ENV,
      resourcesService,
      resourceUtils,
      ResourceBreadcrumbsService,
      BreadcrumbsService,
      ncUtilsFlash) {
      // @ngInject
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.$scope = $scope;
      this.$interval = $interval;
      this.ENV = ENV;
      this.resourcesService = resourcesService;
      this.resourceUtils = resourceUtils;
      this.ResourceBreadcrumbsService = ResourceBreadcrumbsService;
      this.BreadcrumbsService = BreadcrumbsService;
      this.ncUtilsFlash = ncUtilsFlash;

      this.model = null;
    }

    $onInit() {
      this.enableRefresh = true;
      this.activate();
    }

    $onDestroy() {
      this.$interval.cancel(this.refreshPromise);
    }

    activate() {
      this.$scope.$watch(() => this.model, () => this.refreshBreadcrumbs(), true);
      this.loading = true;
      this.getModel().then(response => {
        this.model = response;
        this.afterActivate(response);
      }, this.modelNotFound.bind(this))
        .finally(() => {
          this.loading = false;
        });
    }

    refreshBreadcrumbs() {
      if (!this.model) {
        return;
      }
      this.BreadcrumbsService.items = this.ResourceBreadcrumbsService.getItems(this.model);
      this.BreadcrumbsService.activeItem = this.model.name;
    }

    afterActivate() {
      this.refreshPromise = this.$interval(
        this.reInitResource.bind(this),
        this.ENV.resourcesTimerInterval * 1000
      );
    }

    getModel() {
      return this.resourcesService.$get(this.$stateParams.resource_type, this.$stateParams.uuid);
    }

    modelNotFound() {
      let state = this.resourceUtils.getListState(this.ENV.resourceCategory[this.model.resource_type]);
      this.$state.go(state, {uuid: this.model.project_uuid});
    }

    reInitResource() {
      if (!this.enableRefresh) {
        return;
      }
      return this.getModel().then(model => {
        this.model = model;
      }, error => {
        if (error.status === 404) {
          this.ncUtilsFlash.error(gettext('Resource is gone.'));
          this.modelNotFound();
        }
      });
    }

    handleActionException(response) {
      if (response.status === 409) {
        let message = response.data.detail || response.data.status;
        this.ncUtilsFlash.error(message);
      }
    }
  }
};

export default resourceHeader;
