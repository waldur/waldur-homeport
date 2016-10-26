'use strict';

(function() {

  angular.module('ncsaas')
    .directive('usersUiSelect', usersUiSelect);

  function usersUiSelect() {
    return {
      restrict: 'E',
      scope: {
        users: '=',
        model: '='
      },
      templateUrl: 'views/directives/users-ui-select.html'
    };
  }
})();
