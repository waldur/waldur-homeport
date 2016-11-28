// @ngInject
export default function issueRoutes($stateProvider) {
  $stateProvider
    .state('support', {
      url: '/support/',
      template: '<issues-workspace></issues-workspace>',
      abstract: true,
      data: {
        auth: true,
      }
    })

    .state('support.dashboard', {
      url: '',
      template: '<issues-dashboard></issue-dashboard>',
      data: {
        pageTitle: 'Support dashboard',
        pageClass: 'gray-bg'
      }
    })

    .state('support.list', {
      url: 'list/',
      template: '<issues-list></issues-list>',
      data: {
        pageTitle: 'List issues'
      }
    })

    .state('support.create', {
      url: 'add/:type',
      template: '<issue-create></issue-create>',
      data: {
        pageTitle: 'Create issue'
      }
    });
}
