'use strict';

(function() {
  angular.module('ncsaas')
    .directive('detailsView', ['$rootScope', '$state', '$stateParams', 'ncUtils', detailsView]);

  function detailsView($rootScope, $state, $stateParams, ncUtils) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/details-view.html",
      replace: true,
      scope: {
        options: '=detailsOptions',
        controller: '=detailsController'
      },
      link: function(scope) {
        scope.search = search;
        scope.tabChange = tabChange;
        scope.hideSearch = false;

        getSearchStatus(scope.options.activeTab);

        function tabChange(tab) {
          scope.options.activeTab = tab;
          var params = $stateParams || {};
          params.tab = tab;
          $state.go($state.current.name, params);
          getSearchStatus(tab);
        }

        function getSearchStatus(tab) {
          scope.hideSearch = false;
          for (var i = 0; i < scope.options.tabs.length; i++) {
            if (scope.options.tabs[i].key === tab) {
              scope.hideSearch = scope.options.tabs[i].hideSearch;
              break;
            }
          }
        }

        function search() {
          $rootScope.$broadcast('generalSearchChanged', scope.controller.generalSearch);
        }

        if (scope.controller.loadAll) {
          scope.controller.loading = true;
          ncUtils.blockElement('detailsBlock', scope.controller.loadAll().finally(function() {
            scope.controller.loading = false;
          }));
        } else {
          scope.controller.loading = false;
        }
      }
    };
  }
})();