'use strict';

(function() {
  angular.module('ncsaas')
    .directive('checkQuotas', ['currentStateService', '$state', '$rootScope', checkQuotas]);

  function checkQuotas(currentStateService, $state, $rootScope) {
    var directive = {
      restrict: 'A',
      replace: true,
      transclude: true,
      templateUrl: "views/directives/check-quotas.html",
      scope: {
        checkQuotas: '@',
        tooltipType: '@',
        sref: '@',
        classLink: '@'
      },
      controller: checkQuotasController,
      link: checkQuotasLink
    };

    /**
     * Link function
     * @param scope
     * @param element
     */
    function checkQuotasLink(scope, element) {
      refresh(scope, element);
      scope.$on('checkQuotas:refresh', function() {
        refresh(scope, element);
      });
    }

    /**
     * Update disable state for directive element
     * @param scope
     * @param element
     */
    function refresh(scope, element) {
      // checkQuotas - quota type: resource, project, service, user
      // tooltipType: listItems, emptyListItems, addUser
      var item = scope.checkQuotas;

      currentStateService.getCustomer().then(function(response) {

        var style = calculatePosition(element, scope.tooltipType);

        scope.tooltipStyle = style.tooltipStyle;
        scope.triangleBefore = style.triangleBefore;
        scope.triangleAfter = style.triangleAfter;
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

        scope.classes.disabled = scope.enable;

      });
    }

    /**
     * Calculate position style for tooltip
     * @param element
     * @param tooltipType
     * @returns {{triangleBefore: ({right: string}|*), triangleAfter: ({right: string}|*), tooltipStyle: *}}
     */
    function calculatePosition(element, tooltipType) {
      var triangleBefore,
          triangleAfter,
          tooltipStyle;

      triangleAfter = triangleBefore = Math.floor(element[0].offsetWidth / 2) || 100;

      triangleBefore = {right: triangleBefore + 'px'};
      triangleAfter = {right: triangleAfter + 1 + 'px'};

      switch (tooltipType) {
        case 'listItems': {
          tooltipStyle = {top: '35px'};
          break;
        }
        case 'headNavAppstore': {
          tooltipStyle = {top: '50px'};
          break;
        }
        case 'userDropDown': {
          tooltipStyle = {top: '44px'};
          break;
        }
        case 'projectDropDown': {
          tooltipStyle = {top: '10px', right: '-220px'};
          break;
        }
        case 'addUser': {
          tooltipStyle = {top: '110%', left: 0, width: '350px'};
          triangleBefore = {left: '20px'};
          triangleAfter = {left: '21px'};
          break;
        }
      }

      return {
          triangleBefore: triangleBefore,
          triangleAfter: triangleAfter,
          tooltipStyle : tooltipStyle
      };
    }

    checkQuotasController.$inject = ['$scope'];

    /**
     * Controller function
     * @param $scope
     */
    function checkQuotasController($scope) {
      $scope.showMessage = false;
      $scope.classes = {};

      var classes;
      if ($scope.classLink && (classes = $scope.classLink.split(' '))) {
        classes.forEach(function(i) {
          $scope.classes[i] = true;
        });
      }

      $scope.$on('checkQuotas:closeAll', function() {
        $scope.closeTooltip();
      });

      $scope.closeTooltip = function() {
        $scope.showMessage = false;
      };

      $scope.openTooltip = function() {
        $scope.showMessage = true;
      };

      $scope.handleAction = function(e) {
        if ($scope.enable) {
          $rootScope.$broadcast('checkQuotas:closeAll');
          $scope.openTooltip();
          e.preventDefault();
          e.stopPropagation();
        } else if ($scope.sref) {
          $state.go($scope.sref);
        }
      };

    }

    return directive;
  }
})();
