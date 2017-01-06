import template from './resource-header.html';

export default function resourceHeader() {
  return {
    template: template,
    controller: ResourceDetailUpdateController,
    controllerAs: 'controller',
  };
}

// @ngInject
function ResourceDetailUpdateController(
  $stateParams,
  $state,
  $scope,
  $rootScope,
  $interval,
  ENV,
  resourcesService,
  resourcesCountService,
  resourceUtils,
  alertsService,
  servicesService,
  baseControllerDetailUpdateClass,
  currentStateService,
  ncUtilsFlash) {
  var controllerScope = this;
  var Controller = baseControllerDetailUpdateClass.extend({
    defaultErrorMessage: ENV.defaultErrorMessage,

    init:function() {
      this.service = resourcesService;
      this.controllerScope = controllerScope;
      this._super();
      controllerScope.enableRefresh = true;
    },

    getModel: function() {
      return this.service.$get($stateParams.resource_type, $stateParams.uuid);
    },

    reInitResource: function() {
      if (!controllerScope.enableRefresh) {
        return;
      }
      return controllerScope.getModel().then(function(model) {
        controllerScope.model = model;
      }, function(error) {
        if (error.status === 404) {
          ncUtilsFlash.error('Resource is gone.');
          this.modelNotFound();
        }
      }.bind(this));
    },

    afterActivate: function() {
      this.updateMenu();
      this.updateResourceTab();
      this.scheduleRefresh();
    },

    updateMenu: function() {
      controllerScope.context = {resource: controllerScope.model};
      controllerScope.listState = this.getListState(this.model.resource_type)
                                  + '({uuid: ResourceCtrl.context.resource.project_uuid})';
      controllerScope.listTitle = this.getListTitle(this.model.resource_type);
    },

    getListTitle: function(resourceType) {
      var resourceCategory = ENV.resourceCategory[resourceType];
      if (resourceCategory === 'apps') {
        return 'Applications';
      } else if (resourceCategory === 'private_clouds') {
        return 'Private clouds';
      } else if (resourceCategory === 'storages') {
        return 'Storage';
      } else {
        return 'Virtual machines';
      }
    },

    getListState: function(resourceType) {
      var resourceCategory = ENV.resourceCategory[resourceType];
      if (resourceCategory === 'apps') {
        return 'project.resources.apps';
      } else if (resourceCategory === 'private_clouds') {
        return 'project.resources.clouds';
      } else if (resourceCategory === 'storages') {
        return 'project.resources.storage.tabs';
      } else {
        return 'project.resources.vms';
      }
    },

    updateResourceTab: function() {
      var resourceCategory = ENV.resourceCategory[this.model.resource_type];
      if (resourceCategory) {
        this.resourceTab = resourceCategory;
      } else {
        this.resourceTab = ENV.resourcesTypes.vms;
      }
    },

    scheduleRefresh: function() {
      var refreshPromise = $interval(
        this.reInitResource.bind(this),
        ENV.resourcesTimerInterval * 1000
      );

      $scope.$on('$destroy', function() {
        $interval.cancel(refreshPromise);
      });
    },

    afterInstanceRemove: function() {
      this.service.clearAllCacheForCurrentEndpoint();
      $rootScope.$broadcast('refreshCounts');

      var state = this.getListState(this.model.resource_type);
      $state.go(state, {uuid: this.model.project_uuid});
    },

    modelNotFound: function() {
      currentStateService.getProject().then(function(project) {
        $state.go('project.details', {uuid: project.uuid});
      }, function() {
        currentStateService.getCustomer().then(function(response) {
          $state.go('organization.details', {uuid: response.uuid});
        }, function() {
          $state.go('dashboard.index');
        });
      });
    },

    update: function() {
      var vm = this;
      vm.model.$update(function success() {
        resourcesService.clearAllCacheForCurrentEndpoint();
      }, function error(response) {
        vm.errors = response.data;
      });
    }
  });

  controllerScope.__proto__ = new Controller();
}
