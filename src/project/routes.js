// @ngInject
export default function projectRoutes($stateProvider) {
  $stateProvider
    .state('project', {
      url: '/projects/:uuid/',
      abstract: true,
      template: '<project-base></project-base>',
      data: {
        auth: true,
        workspace: 'project',
      },
    })

    .state('project.details', {
      url: '',
      template: '<project-dashboard></project-dashboard>',
      data: {
        pageTitle: gettext('Dashboard'),
        pageClass: 'gray-bg',
        hideBreadcrumbs: true,
      },
    })

    .state('project.issues', {
      url: 'issues/',
      template: '<project-issues></project-issues>',
      data: {
        feature: 'support',
        pageTitle: gettext('Issues'),
        pageClass: 'gray-bg',
      },
    })

    .state('project.events', {
      url: 'events/',
      template: '<project-events></project-events>',
      data: {
        pageTitle: gettext('Audit logs'),
      },
    })

    .state('project.resources', {
      url: '',
      abstract: true,
      template: '<ui-view></ui-view>',
    })

    .state('project.resources.vms', {
      url: 'virtual-machines/',
      template: '<resource-vms-list></resource-vms-list>',
      data: {
        pageTitle: gettext('Virtual machines'),
      },
    })

    .state('project.resources.clouds', {
      url: 'private-clouds/',
      template: '<resource-private-clouds-list></resource-private-clouds-list>',
      data: {
        pageTitle: gettext('Private clouds'),
      },
    })

    .state('project.resources.storage', {
      url: 'storage/',
      template: '<ui-view></ui-view>',
      data: {
        pageTitle: gettext('Storage'),
      },
      abstract: true,
    })

    .state('project.resources.storage.tabs', {
      url: '',
      template: '<resource-storage-tabs></resource-storage-tabs>',
    })

    .state('project.team', {
      url: 'team/',
      template: '<project-team>',
      data: {
        pageTitle: gettext('Team'),
      },
    });
}
