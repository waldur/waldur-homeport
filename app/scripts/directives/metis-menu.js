'use strict';

(function() {

  angular.module('ncsaas')
    .directive('metisMenu', ['$timeout', metisMenu]);

  function metisMenu($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        $timeout(function(){
          element.metisMenu();
        });
      }
    };
  }
})();
