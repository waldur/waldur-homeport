import { StateDeclaration } from '@waldur/core/types';
import { checkPermission } from '@waldur/issues/utils';

import { VmTypeOverviewContainer } from './VmTypeOverviewContainer';

export const states: StateDeclaration[] = [
  {
    name: 'support.vm-type-overview',
    url: 'vm-type-overview/',
    component: VmTypeOverviewContainer,
    data: {
      feature: 'support.vm-type-overview',
    },
    resolve: {
      permission: checkPermission,
    },
  },
];
