'use strict';

(function() {
    angular.module('ncsaas')
        .controller('MainController', ['$rootScope','$location', '$auth','usersService','authService', MainController]);

    function MainController($rootScope, $location, $auth,usersService,authService) {
        console.log('Main controller');
        $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
            //console.log(current);
            if (current.$$route != undefined && (current.$$route.originalPath === '/login/' || current.$$route.originalPath === '/')){
                if (authService.getAuthCookie() != null){
                    //console.log('auth');
                    $location.path('/dashboard');
                }
            }
        });
        $rootScope.bodyClass = 'site-body';

    }

})();
