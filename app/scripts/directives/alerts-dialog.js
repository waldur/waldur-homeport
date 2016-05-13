'use strict';

(function() {

    angular.module('ncsaas')
        .directive('alertsDialog', ['alertsService', 'eventsService', alertDialog]);

    function alertDialog(alertsService, eventsService) {
        return {
            restrict: 'E',
            scope: {
                type: '@'
            },
            templateUrl: 'views/directives/alerts-dialog.html',
            link: function(scope) {
                scope.showData = true;
                scope.types = scope.type === 'alerts' ?
                    alertsService.getAvailableIconTypes() :
                    eventsService.getAvailableIconTypes();
                !scope.types && (scope.showData = false);
            }
        };
    }

})();
