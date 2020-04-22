import { checkPermission } from '@waldur/issues/routes';
import { withStore } from '@waldur/store/connect';

import { VmTypeOverviewContainer } from './VmTypeOverviewContainer';

// @ngInject
export default function analyticsRoutes($stateProvider) {
  $stateProvider.state('support.vm-type-overview', {
    url: 'vm-type-overview/',
    component: withStore(VmTypeOverviewContainer),
    data: {
      feature: 'support.vm-type-overview',
      pageTitle: gettext('VM type overview'),
    },
    resolve: {
      permission: checkPermission,
    },
  });
}
