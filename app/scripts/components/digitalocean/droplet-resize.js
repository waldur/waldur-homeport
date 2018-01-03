import template from './droplet-resize.html';

export default function dropletResizeDialog() {
  return {
    restrict: 'E',
    template: template,
    controller: DropletResizeDialogController,
  };
}

// @ngInject
function DropletResizeDialogController($scope, $filter, resourcesService, resourceUtils,
  actionUtilsService, ActionResourceLoader) {
  angular.extend($scope, {
    loading: true,
    options: {
      resizeType: 'flexible',
      newSize: null,
    },
    init: function() {
      $scope.loadDroplet().then(function() {
        return $scope.loadValidSizes().then(function() {
          $scope.loading = false;
        });
      }).catch(function(error) {
        $scope.loading = false;
        $scope.error = error.message;
      });
    },
    formatSize: resource => $filter('formatFlavor')(resource),
    loadDroplet: function() {
      return resourcesService.$get(null, null, $scope.resource.url, {
        field: ['cores', 'ram', 'disk']
      }).then(function(droplet) {
        angular.extend($scope.resource, droplet);
      });
    },
    loadValidSizes: function() {
      return actionUtilsService.loadActions($scope.resource).then(function(actions) {
        $scope.action = actions.resize;
        if (!$scope.action.enabled) {
          return;
        }
        return ActionResourceLoader.loadRawChoices($scope.action.fields.size).then(function(sizes) {
          sizes.forEach(function(size) {
            size.enabled = $scope.isValidSize(size);
          });
          sizes.sort(function(size1, size2) {
            return size1.enabled < size2.enabled;
          });
          $scope.sizes = sizes;
        });
      });
    },
    isValidSize: function(size) {
      // 1. New size should not be the same as the current size
      // 2. New size disk should not be lower then current size disk
      let droplet = $scope.resource;
      return size.disk !== droplet.disk &&
             size.cores !== droplet.cores &&
             size.ram !== droplet.ram &&
             size.disk >= droplet.disk;
    },
    submitForm: function() {
      let form = resourcesService.$create($scope.action.url);
      form.size = $scope.options.newSize.url;
      form.disk = $scope.options.resizeType === 'permanent';
      return form.$save().then(function() {
        actionUtilsService.handleActionSuccess($scope.action);
        $scope.errors = {};
        $scope.$close();
        $scope.controller.reInitResource($scope.resource);
      }, function(response) {
        $scope.errors = response.data;
      });
    }
  });
  $scope.init();
}
