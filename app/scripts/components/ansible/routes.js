// @ngInject
export default function ansibleRoutes($stateProvider) {
  $stateProvider
    .state('appstore.ansible', {
      url: 'applications/',
      template: '<appstore-store></appstore-store>',
      data: {
        // TODO: Replace with real route when WAL-1047 is ready
        category: 'private_clouds',
        pageTitle: gettext('Applications'),
        sidebarState: 'project.resources'
      }
    });
}
