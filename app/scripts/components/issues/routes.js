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

    .state('support.helpdesk', {
      url: 'helpdesk/',
      template: '<issues-helpdesk></issues-helpdesk>',
      data: {
        pageTitle: 'Helpdesk dashboard',
        pageClass: 'gray-bg'
      }
    })

    .state('support.createIssue', {
      url: 'helpdesk/create/',
      template: '<issue-create-page></issue-create-page>',
      data: {
        pageTitle: 'Create issue',
        pageClass: 'gray-bg'
      }
    })

    .state('support.list', {
      url: 'list/',
      template: '<issues-list-filtered></issues-list-filtered>',
      data: {
        pageTitle: 'List issues',
        pageClass: 'gray-bg'
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
