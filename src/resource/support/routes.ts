import { lazyComponent } from '@waldur/core/lazyComponent';
import { StateDeclaration } from '@waldur/core/types';
import { translate } from '@waldur/i18n';

const SharedProviderContainer = lazyComponent(
  () => import('./SharedProviderContainer'),
  'SharedProviderContainer',
);

export const states: StateDeclaration[] = [
  {
    name: 'support.shared-providers',
    url: 'shared-providers/',
    component: SharedProviderContainer,
    data: {
      feature: 'support.shared_providers',
      breadcrumb: () => translate('Shared providers'),
    },
  },
];
