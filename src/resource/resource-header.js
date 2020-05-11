import { blockingExecutor } from '@waldur/core/services';
import { getCategoryLink } from '@waldur/marketplace/utils';

import { ResourceBreadcrumbsRegistry } from './breadcrumbs/ResourceBreadcrumbsRegistry';
import template from './resource-header.html';

const resourceHeader = {
  template: template,
  controller: class ResourceHeaderController {
    // @ngInject
    constructor(
      $rootScope,
      $stateParams,
      $state,
      $scope,
      $interval,
      ENV,
      features,
      resourcesService,
      BreadcrumbsService,
      ncUtilsFlash,
    ) {
      this.$rootScope = $rootScope;
      this.$stateParams = $stateParams;
      this.$state = $state;
      this.$scope = $scope;
      this.$interval = $interval;
      this.ENV = ENV;
      this.features = features;
      this.resourcesService = resourcesService;
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
      this.$scope.$watch(
        () => this.model,
        () => this.refreshBreadcrumbs(),
        true,
      );
      this.loading = true;
      this.getModel()
        .then(response => {
          this.model = response;
          this.afterActivate(response);
        }, this.modelNotFound.bind(this))
        .finally(() => {
          this.loading = false;
        });
      this.$scope.$on('refreshResource', () => this.reInitResource());
    }

    refreshBreadcrumbs() {
      if (!this.model) {
        return;
      }
      this.BreadcrumbsService.items = ResourceBreadcrumbsRegistry.getItems(
        this.model,
      );
      this.BreadcrumbsService.activeItem = this.model.name;
    }

    afterActivate() {
      this.refreshPromise = this.$interval(
        blockingExecutor(this.reInitResource.bind(this)),
        this.ENV.resourcesTimerInterval * 1000,
      );
      this.activeItem = getCategoryLink(this.model.marketplace_category_uuid);
    }

    getModel() {
      return this.resourcesService.$get(
        this.$stateParams.resource_type,
        this.$stateParams.uuid,
      );
    }

    modelNotFound() {
      if (!this.model) {
        this.$state.go('errorPage.notFound');
        return;
      }
      if (this.model.marketplace_category_uuid) {
        this.$state.go('marketplace-project-resources', {
          category_uuid: this.model.marketplace_category_uuid,
          uuid: this.model.project_uuid,
        });
      } else {
        this.$state.go('project.details', { uuid: this.model.project_uuid });
      }
    }

    reInitResource() {
      if (!this.enableRefresh) {
        return;
      }
      return this.getModel().then(
        model => {
          if (!model.modified || model.modified !== this.model.modified) {
            this.model = model;
            this.$rootScope.$broadcast('refreshResourceSucceeded');
          } else {
            // Skip update to avoid extra re-rendering
          }
        },
        error => {
          if (error.status === 404) {
            this.ncUtilsFlash.error(gettext('Resource is gone.'));
            this.modelNotFound();
          }
        },
      );
    }

    handleActionException(response) {
      if (response.status === 409) {
        const message = response.data.detail || response.data.status;
        this.ncUtilsFlash.error(message);
      }
    }
  },
};

export default resourceHeader;
