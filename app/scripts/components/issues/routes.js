// @ngInject
function checkPermission(usersService, $q) {
  return usersService.getCurrentUser().then(user => {
    if (!user.is_staff && !user.is_support) {
      return $q.reject();
    }
  });
}

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
      template: '<resource-global-list-filtered/>',
      data: {
        feature: 'support.resources',
        pageTitle: gettext('Resources'),
      },
      resolve: {
        permission: checkPermission
      }
    })

    .state('support.organizations', {
      url: 'organizations/',
      template: '<div class="ibox-content"><customer-list/></div>',
      data: {
        feature: 'support.organizations',
        pageTitle: gettext('Financial overview'),
      },
      resolve: {
        permission: checkPermission
      }
    });
}
