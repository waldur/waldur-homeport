// @ngInject
export default function aboutRoutes($stateProvider) {
  $stateProvider
    .state('tos', {
      url: '/tos/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
    })

    .state('tos.index', {
      url: '',
      views: {
        appContent: {
          templateUrl: 'views/tos/index.html',
        },
        appHeader: {
          template: '<site-header></site-header>',
        },
      },
      data: {
        bodyClass: 'old',
        pageTitle: 'Terms of service'
      }
    })

    .state('about', {
      url: '/about/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
    })

    .state('about.index', {
      url: '',
      views: {
        appContent: {
          templateUrl: 'views/about/index.html',
        },
        appHeader: {
          template: '<site-header></site-header>',
        },
      },
      data: {
        bodyClass: 'old',
        pageTitle: 'About'
      }
    })

    .state('policy', {
      url: '/policy/',
      abstract: true,
      templateUrl: 'views/partials/base.html',
    })

    .state('policy.privacy', {
      url: 'privacy/',
      views: {
        appContent: {
          templateUrl: 'views/policy/privacy.html',
        },
        appHeader: {
          template: '<site-header></site-header>',
        },
      },
      data: {
        bodyClass: 'old',
        pageTitle: 'Privacy policy'
      }
    });
}
