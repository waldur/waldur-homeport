'use strict';

(function() {
  ImportableResourcesController.$inject = ['$scope', 'resourceUtils'];
  function ImportableResourcesController($scope, resourceUtils) {
    $scope.getResourceDetails = resourceUtils.setSummary;
  }

  angular.module('ncsaas')
    .directive('importableResources', importableResources);

    function importableResources() {
      return {
        restrict: 'E',
        templateUrl: 'views/directives/importable-resources.html',
        scope: {
          noResources: '=empty',
          currentProject: '=project',
          selectedService: '=service',
          resources: '=',
          toggleResource: '=toggle',
        },
        controller: ImportableResourcesController
      };
    }
})();
