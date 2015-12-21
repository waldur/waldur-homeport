'use strict';

(function() {
  angular.module('ncsaas')
    .directive('detailsView', ['$rootScope', '$state', '$stateParams', detailsView]);

  function detailsView($rootScope, $state, $stateParams) {
    return {
      restrict: 'E',
      templateUrl: "views/directives/details-view.html",
      replace: true,
      scope: {
        options: '=detailsOptions',
        controller: '=detailsController'
      },
      link: function(scope) {
        scope.generalSearch = '';
        scope.search = search;
        scope.tabChange = tabChange;
        scope.hideSearch = false;

        getSearchStatus(scope.options.activeTab);

        function tabChange(tab) {
          scope.options.activeTab = tab;
          var params = $stateParams || {};
          params.tab = tab;
          $state.transitionTo($state.current.name, params, {notify: false});
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
          $rootScope.$broadcast('generalSearchChanged', scope.generalSearch);
        }
      }
    };
  }
})();