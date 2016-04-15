'use strict';

(function() {
  ProjectPriceLimitController.$inject = ['$scope', 'projectsService', 'customersService'];
  function ProjectPriceLimitController($scope, projectsService, customersService) {
    angular.extend($scope, {
      init: function() {
        $scope.loading = true;
        $scope.isHardLimit = $scope.limit !=0 && $scope.limit == $scope.threshold;
        return customersService.isOwnerOrStaff().then(function(value) {
          $scope.userCanManageProjects = value;
          $scope.loading = false;
        });
      },

      setThreshold: function(value) {
        return projectsService.setThreshold($scope.project.price_estimate_url, value);
      },

      toggleLimit: function() {
        $scope.isHardLimit = !$scope.isHardLimit;
        var limit = $scope.isHardLimit && $scope.project.price_threshold || 0;
        return projectsService.setLimit($scope.project.price_estimate_url, limit);
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
