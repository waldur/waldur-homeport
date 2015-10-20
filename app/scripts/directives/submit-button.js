'use strict';

(function() {

  angular.module('ncsaas')
    .directive('submitButton', [submitButton]);

  function submitButton() {
    return {
      restrict: 'A',
      scope: {
        submit: '&submitButton'
      },
      link: function(scope, element) {
        element.bind('click', function() {
          click();
        });
        function click() {
          element.addClass('disabled');
          scope.submit().then(function(response) {
            if (!response) {
              element.removeClass('disabled');
            }
          }, function() {
            element.removeClass('disabled');
          });
        }
      }
    };
  }
})();
