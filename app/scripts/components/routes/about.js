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
        pageTitle: gettext('Terms of service')
      }
    })

    .state('tos.freeipa', {
      url: 'freeipa-terms/',
      templateUrl: 'views/tos/freeipa.html',
      data: {
        bodyClass: 'old',
        pageTitle: gettext('Terms of service'),
        feature: 'freeipa'
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
        pageTitle: gettext('About')
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
        pageTitle: gettext('Privacy policy')
      }
    });
}
