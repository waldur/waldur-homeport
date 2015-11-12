'use strict';

(function() {
  angular.module('ncsaas')
    .directive('imageBox', [imageBox]);

    function imageBox() {
      return {
        restrict: 'E',
        templateUrl: "views/directives/image-box.html",
        replace: true,
        scope: {
          image: '@'
        }
      };
    }
})();
