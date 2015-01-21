'use strict';

(function() {

  angular.module('ncsaas')
    .directive('loginbox', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var winHeight = $window.innerHeight;
          element.css('height', winHeight - 100 + 'px');
        }
      };
    })

    .directive('loginboxcontext', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var winHeight = $window.innerHeight;
          element.css('top', winHeight / 5 + 'px');
        }
      };
    });

})();
