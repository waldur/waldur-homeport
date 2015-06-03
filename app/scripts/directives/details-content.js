'use strict';

(function() {

  angular.module('ncsaas')
    .directive('detailscontent', function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var paddings = {
            'status': 20,
            'checkbox': 40,
            'avatar': 40,
            'expand': 40
          }
          var paddingToSet = 20;
          var a = attrs.detailscontent.split(" ");

          for (var i=0; i<a.length; i++) {
            for (var prop in paddings) {
              if (paddings.hasOwnProperty(prop)) {
                if (a[i] == prop) {
                  paddingToSet = paddingToSet + paddings[prop];
                }
              }
            }
          }
          element.css('padding-left', paddingToSet + 'px');
        }
      };
    });

})();
