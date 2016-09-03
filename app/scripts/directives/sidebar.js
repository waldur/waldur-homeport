'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sidebar', ['$state', sidebar]);

  function sidebar($state, $uibModal) {
    return {
      restrict: 'E',
      scope: {
        items: '=',
        context: '='
      },
      templateUrl: 'views/directives/sidebar.html',
      link: function(scope) {
        scope.$state = $state;
      }
    };
  }

  angular.module('ncsaas')
    .directive('workspaceSelectToggle', ['$uibModal', workspaceSelectToggle]);

  function workspaceSelectToggle($uibModal) {
    return {
      restrict: 'E',
      template: '<a class="btn btn-default btn-sm" ng-click="selectWorkspace()">'+
                '<i class="fa fa-angle-down"></i> Select workspace</a>',
      link: function(scope) {
        scope.selectWorkspace = function() {
          $uibModal.open({
            templateUrl: 'views/directives/select-workspace.html',
            controller: 'SelectWorkspaceController',
            controllerAs: 'Ctrl',
            bindToController: true,
            size: 'lg'
          })
        }
      }
    }
  }

})();
