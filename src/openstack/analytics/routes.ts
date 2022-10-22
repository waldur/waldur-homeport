import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

const VmTypeOverviewContainer = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "VmTypeOverviewContainer" */ './VmTypeOverviewContainer'
    ),
  'VmTypeOverviewContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'reporting.vm-type-overview',
    url: 'vm-type-overview/',
    component: VmTypeOverviewContainer,
    data: {
      feature: 'support.vm_type_overview',
      breadcrumb: () => translate('VM type overview'),
    },
  },
];
