// @ngInject
export default function authCallbackRoutes($stateProvider) {
  $stateProvider
    .state('home.login_completed', {
      url: '/login_completed/:token/:method/',
      template: '<auth-login-completed></auth-login-completed>',
      data: {
        anonymous: true,
        bodyClass: 'old',
      }
    })

    .state('home.login_failed', {
      url: '/login_failed/',
      template: '<auth-login-failed></auth-login-failed>',
      data: {
        bodyClass: 'old',
        erred: true,
      }
    })

    .state('home.logout_completed', {
      url: '/logout_completed/',
      template: '<auth-logout-completed></auth-logout-completed>',
      data: {
        bodyClass: 'old',
      }
    })

    .state('home.logout_failed', {
      url: '/logout_failed/',
      template: '<auth-logout-failed></auth-logout-failed>',
      data: {
        bodyClass: 'old',
        erred: true,
      }
    });
}
