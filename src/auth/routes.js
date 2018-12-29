// @ngInject
export default function authRoutes($stateProvider) {
  $stateProvider
    .state('home', {
      url: '',
      abstract: true,
      templateUrl: 'views/partials/base.html',
    })

    .state('login', {
      url: '/login/',
      template: '<auth-login mode="\'login\'"></auth-login>',
      data: {
        bodyClass: 'old',
        anonymous: true,
      }
    })

    .state('register', {
      url: '/register/',
      template: '<auth-login mode="\'register\'"></auth-login>',
      data: {
        bodyClass: 'old',
        anonymous: true
      }
    })

    .state('home.activate', {
      url: '/activate/:user_uuid/:token/',
      template: '<auth-activation></auth-activation>',
      data: {
        anonymous: true,
        bodyClass: 'old',
      }
    })

    .state('initialdata', {
      parent: 'home',
      url: '/initial-data/',
      template: '<ui-view></ui-view>',
      abstract: true
    })

    .state('initialdata.view', {
      url: '',
      template: '<auth-init></auth-init>',
      noInitialData: true,
      data: {
        auth: true,
        bodyClass: 'old'
      },
      resolve: {
        // @ngInject
        currentUser: usersService => usersService.getCurrentUser()
      }
    });
}
