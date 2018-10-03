import { WOKSPACE_NAMES } from '../navigation/workspace/constants';

// @ngInject
export default function appstoreRoutes($stateProvider) {
  $stateProvider
    .state('appstore', {
      url: 'appstore/',
      parent: 'project',
      abstract: true,
      template: '<ui-view></ui-view>',
      data: {
        auth: true,
        pageTitle: gettext('Service store'),
        workspace: WOKSPACE_NAMES.project,
        pageClass: 'gray-bg'
      }
    })

    .state('appstore.private_clouds', {
      url: 'private_clouds/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'private_clouds',
        pageTitle: gettext('Private clouds'),
        sidebarState: 'project.resources'
      }
    })

    .state('appstore.vms', {
      url: 'vms/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'vms',
        pageTitle: gettext('Virtual machines'),
        sidebarState: 'project.resources'
      }
    })

    .state('appstore.apps', {
      url: 'apps/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'apps',
        pageTitle: gettext('Applications'),
        sidebarState: 'project.resources'
      }
    })

    .state('appstore.storages', {
      url: 'storages/',
      template: '<appstore-store></appstore-store>',
      data: {
        category: 'storages',
        pageTitle: gettext('Storages'),
        sidebarState: 'project.resources'
      }
    });
}
