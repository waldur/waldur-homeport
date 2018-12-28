import moduleLoader from './loader';
import { checkPermission } from '@waldur/issues/routes';

// @ngInject
export default function analyticsRoutes($stateProvider) {
  $stateProvider
    .state('organization.analysis', {
      url: '',
      abstract: true,
      template: '<ui-view></ui-view>',
      resolve: {
        module: moduleLoader
      }
    })

    .state('organization.analysis.resources', {
      url: 'resource-usage/',
      template: '<resource-analysis-container></resource-analysis-container>',
      data: {
        pageClass: 'gray-bg',
        pageTitle: gettext('Resource usage')
      }
    })

    .state('support.vm-type-overview', {
      url: 'vm-type-overview/',
      template: '<vm-type-overview></vm-type-overview>',
      data: {
        feature: 'support.vm-type-overview',
        pageTitle: gettext('VM type overview'),
      },
      resolve: {
        permission: checkPermission,
        module: moduleLoader
      }
    });
}
