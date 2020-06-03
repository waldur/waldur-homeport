import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { checkPermission } from '@waldur/issues/utils';

import { VmTypeOverviewContainer } from './VmTypeOverviewContainer';

export const states: StateDeclaration[] = [
  {
    name: 'support.vm-type-overview',
    url: 'vm-type-overview/',
    component: VmTypeOverviewContainer,
    data: {
      feature: 'support.vm-type-overview',
      pageTitle: gettext('VM type overview'),
    },
    resolve: {
      permission: checkPermission,
    },
  },
];
