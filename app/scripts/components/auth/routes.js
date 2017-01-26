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
          template: '<site-header></site-header>',
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
          template: '<site-header></site-header>',
        },
        'appContent@home': {
          template: '<auth-activation></auth-activation>',
        }
      },
      data: {
        anonymous: true,
        bodyClass: 'old',
      }
    })

    .state('home.login_complete', {
      url: 'login_complete/:token/',
      views: {
        'appHeader@home': {
          template: '<site-header></site-header>',
        },
        'appContent@home': {
          template: '<auth-login-complete></auth-login-complete>',
        }
      },
      data: {
        anonymous: true,
        bodyClass: 'old',
      }
    })

    .state('home.login_failed', {
      url: 'login_failed/',
      views: {
        'appHeader@home': {
          template: '<site-header></site-header>',
        },
        'appContent@home': {
          template: '<auth-login-failed></auth-login-failed>',
        }
      },
      data: {
        anonymous: true,
        bodyClass: 'old',
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
          template: '<site-header></site-header>',
        },
        'appContent@initialdata': {
          template: '<auth-init></auth-init>',
        }
      },
      noInitialData: true,
      data: {
        auth: true,
        bodyClass: 'old'
      },
      resolve: {
        currentUser: usersService => usersService.getCurrentUser()
      }
    });
}
