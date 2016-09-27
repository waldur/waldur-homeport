'use strict';

(function() {

  angular.module('ncsaas')
    .directive('sidebar', ['$state', sidebar]);

  function sidebar($state) {
    return {
      restrict: 'E',
      scope: {
        items: '=',
        context: '='
      },
      templateUrl: 'views/directives/sidebar.html',
      link: function(scope) {
        scope.onMenuClick = function(event, item) {
          if (item.children) {
            item.expanded = !item.expanded;
            event.preventDefault();
          }
        }
        function syncMenu() {
          angular.forEach(scope.items, function(item) {
            if ($state.$current.data && $state.$current.data.sidebarState) {
              item.expanded = item.link === $state.$current.data.sidebarState;
              return;
            }
            item.expanded = $state.includes(item.link);
          });
        }
        scope.$on('$stateChangeSuccess', function() {
          syncMenu();
        });
        scope.$watch('items', function() {
          syncMenu();
        });
      }
    };
  }
})();
