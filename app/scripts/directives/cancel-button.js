'use strict';

(function() {
    angular.module('ncsaas')
        .directive('cancelButton', ['$state', '$window', cancelButton]);

    function cancelButton($state, $window) {
        return {
            restrict: 'A',
            replace: true,
            link: function(scope, element) {
                element.bind('click', function() {
                    if($window.history.length > 2) {
                        $window.history.back();
                    } else {
                        $state.go('dashboard.index');
                    }
                });
            }
        };
    }
})();
