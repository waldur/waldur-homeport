'use strict';

(function() {
  angular.module('ncsaas')
    .directive('checkQuotas', ['currentStateService', '$state', checkQuotas]);

  function checkQuotas(currentStateService, $state) {
    var directive = {
      restrict: 'A',
      replace: true,
      transclude: true,
      templateUrl: "views/directives/check-quotas.html",
      scope: {
        checkQuotas: '@',
        showMessage: '=',
        tooltipType: '@',
        sref: '@',
        classLink: '@'
      },
      controller: checkQuotasController,
      link: checkQuotasLink
    };

    function checkQuotasLink(scope, element) {

      var refresh = function() {
        // checkQuotas - quota type: resource, project, service, user
        // tooltipType: listItems, emptyListItems, addUser
        // showMessage: boolean
        var item = scope.checkQuotas,
          tooltipType = scope.tooltipType,
          triangleBefore,
          triangleAfter;

        currentStateService.getCustomer().then(function(response) {

          triangleAfter = triangleBefore = Math.floor(element[0].offsetWidth / 2) + 1;

          scope.triangleBefore = {right: triangleBefore};
          scope.triangleAfter = {right: triangleAfter};

          if (tooltipType === 'userDropDown') {
            scope.tooltipStyle = {top: '75px'};
          }
          if (tooltipType === 'projectDropDown') {
            scope.tooltipStyle = {top: '110px'};
          }
          if (tooltipType === 'addUser') {
            scope.triangleBefore = {left: '20px'};
            scope.triangleAfter = {left: '21px'};
            scope.tooltipStyle = {top: '115%', left:0, width: '350px'};
          }

          scope.tooltipType = tooltipType;
          scope.plansLink = 'organizations.plans({uuid:\'' + response.uuid + '\'})';
          scope.enable = false;

          for (var i = 0; i<response.quotas.length; i++) {
            var value = response.quotas[i];
            value.name = value.name.replace(/nc_|_count/gi,'');
            if (item && value.name === item && value.limit > -1 && (value.limit === value.usage || value.limit === 0)) {
              scope.enable = true;
              scope.showMessage = false;
              break;
            }
          }

          scope.classes['disabled-view'] = scope.enable;

        });
      };

      refresh();
      scope.$on('checkQuotas:refresh', function() {
        refresh();
      });
    }

    checkQuotasController.$inject = ['$scope'];
    function checkQuotasController($scope) {

      $scope.classes = {};

      var classes;
      if ($scope.classLink && (classes = $scope.classLink.split(' '))) {
        classes.forEach(function(i) {
          $scope.classes[i] = true;
        });
      }

      $scope.closeTooltip = function() {
        $scope.showMessage = false;
      };

      $scope.handleAction = function(e) {
        if ($scope.enable) {
          $scope.showMessage = true;
          e.preventDefault();
          e.stopPropagation();
        } else {
          $state.go($scope.sref);
        }
      };

    }

    return directive;
  }
})();
