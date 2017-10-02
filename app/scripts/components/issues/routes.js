// @ngInject
export default function issueRoutes($stateProvider) {
  $stateProvider
    .state('support', {
      url: '/support/',
      template: '<issues-workspace></issues-workspace>',
      abstract: true,
      data: {
        auth: true,
        feature: 'support',
        workspace: 'support'
      }
    })

    .state('support.dashboard', {
      url: '',
      template: '<issues-dashboard></issue-dashboard>',
      data: {
        pageTitle: gettext('Support dashboard'),
        hideBreadcrumbs: true
      }
    })

    .state('support.helpdesk', {
      url: 'helpdesk/',
      template: '<issues-helpdesk></issues-helpdesk>',
      data: {
        pageTitle: gettext('Helpdesk dashboard')
      }
    })

    .state('support.detail', {
      url: 'issue/:uuid/',
      template: '<issue-detail></issue-detail>',
      data: {
        pageTitle: gettext('Request detail')
      }
    })

    .state('support.list', {
      url: 'list/',
      template: '<issues-list-filtered></issues-list-filtered>',
      data: {
        pageTitle: gettext('Support requests')
      }
    })

    .state('support.resources', {
      url: 'resources/',
      template: '<issues-resources></issues-resources>',
      data: {
        pageTitle: gettext('Resources'),
      }
    });
}
