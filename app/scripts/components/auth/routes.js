// @ngInject
export default function authRoutes($stateProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
    })

    .state('home.home', {
      url: '',
      views: {
        'appHeader@home': {
          templateUrl: 'views/partials/site-header.html',
        },
        'appContent@home': {
          templateUrl: 'views/home/home.html',
        }
      },
      data: {
        bodyClass: 'landing',
        disabled: true
      },
    })

    .state('login', {
      url: '/login/',
      template: '<auth-login mode="login"></auth-login>',
      data: {
        bodyClass: 'old',
        anonymous: true,
      }
    })

    .state('register', {
      url: '/register/',
      template: '<auth-login mode="register"></auth-login>',
      data: {
        bodyClass: 'old',
        anonymous: true
      }
    })

    .state('home.activate', {
      url: 'activate/:user_uuid/:token/',
      views: {
        'appHeader@home': {
          templateUrl: 'views/partials/site-header.html',
        },
        'appContent@home': {
          template: '<auth-activation></auth-activation>',
        }
      },
      data: {
        anonymous: true
      }
    })

    .state('home.login_complete', {
      url: 'login_complete/:token/',
      views: {
        'appHeader@home': {
          templateUrl: 'views/partials/site-header.html',
        },
        'appContent@home': {
          template: '<auth-login-complete></auth-login-complete>',
        }
      },
      data: {
        anonymous: true
      }
    })

    .state('initialdata', {
      url: '/initial-data/',
      templateUrl: 'views/partials/base.html',
      abstract: true
    })

    .state('initialdata.view', {
      url: '',
      views: {
        'appHeader@initialdata': {
          templateUrl: 'views/partials/site-header-initial.html',
          controller: function($scope, authService) {
            $scope.logout = authService.logout;
          }
        },
        'appContent@initialdata': {
          template: '<auth-init></auth-init>',
        }
      },
      noInitialData: true,
      data: {
        auth: true,
        bodyClass: 'old'
      }
    });
}
