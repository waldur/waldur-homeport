// @ngInject
export default function ansibleRoutes($stateProvider) {
  $stateProvider
    .state('appstore.jupyterHubManagement', {
      url: 'jupyterHubManagement/',
      template: '<jupyter-hub-management-create-container></jupyter-hub-management-create-container>',
      data: {
        pageTitle: gettext('Applications'),
        sidebarState: 'project.resources',
        feature: 'jupyterHubManagement'
      }
    })

    .state('project.resources.jupyterHubManagement', {
      url: 'jupyterHubManagement/',
      template: '<ui-view></ui-view>',
      abstract: true,
    })

    .state('project.resources.jupyterHubManagement.details', {
      url: ':jupyterHubManagementUuid/',
      template: '<jupyter-hub-management-details-container></jupyter-hub-management-details-container>',
      data: {
        pageTitle: gettext('JupyterHub Management details'),
        pageClass: 'gray-bg',
        feature: 'jupyterHubManagement',
      }
    })
  ;
}
