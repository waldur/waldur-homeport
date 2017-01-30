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
      templateUrl: 'views/tos/index.html',
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
      templateUrl: 'views/about/index.html',
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
      templateUrl: 'views/policy/privacy.html',
      data: {
        bodyClass: 'old',
        pageTitle: 'Privacy policy'
      }
    });
}
