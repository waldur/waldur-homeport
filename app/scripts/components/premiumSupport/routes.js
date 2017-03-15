// @ngInject
export default function premiumSupportRoute($stateProvider) {
  $stateProvider
    .state('appstore.premiumSupport', {
      url: 'support/',
      parent: 'project',
      template: '<premium-support-provision></premium-support-provision>',
      data: {
        pageTitle: gettext('Premium support'),
        pageClass: 'gray-bg',
        workspace: 'project',
        category: 'support'
      }
    })

    .state('project.support', {
      url: 'support/',
      template: '<premium-support-contracts></premium-support-contracts>',
      data: {
        pageTitle: gettext('Premium support')
      }
    });
}
