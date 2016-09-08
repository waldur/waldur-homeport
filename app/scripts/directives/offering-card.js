'use strict';

(function() {
  angular.module('ncsaas')
    .directive('offeringCard', offeringCard);

    function offeringCard() {
      return {
        restrict: 'E',
        templateUrl: 'views/directives/offering-card.html',
        scope: {
          offering: '='
        }
      };
    }
})();
