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
          element.addClass('disabled').addClass('button-spinner');
          scope.submit().then(function(response) {
            if (response !== true) {
              element.removeClass('disabled').removeClass('button-spinner');
            }
          }, function() {
            element.removeClass('disabled').removeClass('button-spinner');
          });
        }
      }
    };
  }
})();
