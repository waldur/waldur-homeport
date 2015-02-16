'use strict';

(function() {
    angular.module('ncsaas')
        .controller('MainController', ['$rootScope','$location', '$auth','usersService','authService', MainController]);

    function MainController($rootScope, $location, $auth,usersService,authService) {
        $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
            if (current.$$route != undefined && (current.$$route.originalPath === '/login/' || current.$$route.originalPath === '/')){
                if (authService.getAuthCookie() != null){
                    $location.path('/dashboard');
                }
            }
        });
        $rootScope.bodyClass = 'site-body';

    }

})();
