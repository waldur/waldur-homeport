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
  baseControllerDetailUpdateClass,
  currentStateService,
  resourceUtils,
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
      var refreshPromise = $interval(
        this.reInitResource.bind(this),
        ENV.resourcesTimerInterval * 1000
      );

      $scope.$on('$destroy', function() {
        $interval.cancel(refreshPromise);
      });
    },

    afterInstanceRemove: function(resource) {
      this.service.clearAllCacheForCurrentEndpoint();
      $rootScope.$broadcast('refreshCounts');

      var state = resourceUtils.getListState(resource.resource_type);
      $state.go(state, {uuid: this.model.project_uuid});
    },

    modelNotFound: function() {
      currentStateService.getProject().then(function(project) {
        $state.go('project.details', {uuid: project.uuid});
      }, function() {
        currentStateService.getCustomer().then(function(response) {
          $state.go('organization.details', {uuid: response.uuid});
        }, function() {
          $state.go('profile.details');
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
