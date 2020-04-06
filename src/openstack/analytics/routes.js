import { checkPermission } from '@waldur/issues/routes';

// @ngInject
export default function analyticsRoutes($stateProvider) {
  $stateProvider.state('support.vm-type-overview', {
    url: 'vm-type-overview/',
    template: '<vm-type-overview></vm-type-overview>',
    data: {
      feature: 'support.vm-type-overview',
      pageTitle: gettext('VM type overview'),
    },
    resolve: {
      permission: checkPermission,
      module: moduleLoader,
    },
  });
}
