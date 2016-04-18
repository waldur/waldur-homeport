'use strict';

(function() {
  ProjectPriceLimitController.$inject = ['$scope', 'projectsService', 'customersService'];
  function ProjectPriceLimitController($scope, projectsService, customersService) {
    angular.extend($scope, {
      init: function() {
        $scope.loading = true;
        $scope.estimate = $scope.project.price_estimate;
        $scope.isHardLimit = $scope.estimate.limit > 0 && $scope.estimate.limit == $scope.estimate.threshold;
        return customersService.isOwnerOrStaff().then(function(value) {
          $scope.userCanManageProjects = value;
          $scope.loading = false;
        });
      },

      isOverThreshold: function() {
        return $scope.estimate.threshold > 0 && $scope.estimate.total >= $scope.estimate.threshold;
      },

      setThreshold: function(value) {
        return projectsService.setThreshold($scope.project.url, value);
      },

      toggleLimit: function() {
        $scope.isHardLimit = !$scope.isHardLimit;
        var limit = $scope.isHardLimit && $scope.estimate.threshold || 0;
        return projectsService.setLimit($scope.project.url, limit);
      }
    });
    $scope.init();
  }

  angular.module('ncsaas')
    .directive('projectPriceLimit', projectPriceLimit);

    function projectPriceLimit() {
      return {
        restrict: 'E',
        templateUrl: 'views/directives/project-price-limit.html',
        scope: {
          project: '='
        },
        controller: ProjectPriceLimitController
      };
    }
})();
