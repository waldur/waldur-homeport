// @ngInject
export default function routes($stateProvider) {
  $stateProvider
    .state('appstore.pythonManagement', {
      url: 'pythonManagement/',
      template: '<python-management-create-container/>',
      data: {
        pageTitle: gettext('Applications'),
        sidebarState: 'project.resources',
        feature: 'pythonManagement'
      }
    })

    .state('project.resources.pythonManagement', {
      url: 'pythonManagement/',
      template: '<ui-view/>',
      abstract: true,
    })

    .state('project.resources.pythonManagement.details', {
      url: ':pythonManagementUuid/',
      template: '<python-management-details-container/>',
      data: {
        pageTitle: gettext('Python Management details'),
        pageClass: 'gray-bg',
        feature: 'pythonManagement',
      }
    });
}
