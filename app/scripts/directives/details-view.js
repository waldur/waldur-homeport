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

        function tabChange(tab) {
          scope.options.activeTab = tab;
          var params = $stateParams || {};
          params.tab = tab;
          $state.transitionTo($state.current.name, params, {notify: false});
        }

        function search() {
          $rootScope.$broadcast('generalSearchChanged', scope.generalSearch);
        }
      }
    };
  }
})();