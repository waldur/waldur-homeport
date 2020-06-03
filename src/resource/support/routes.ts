import { StateDeclaration } from '@waldur/core/types';
import { gettext } from '@waldur/i18n';
import { checkPermission } from '@waldur/issues/utils';

import { ResourcesTreemap } from './ResourcesTreemap';
import { SharedProviderContainer } from './SharedProviderContainer';

export const states: StateDeclaration[] = [
  {
    name: 'support.resources-treemap',
    url: 'resources-treemap/',
    component: ResourcesTreemap,
    data: {
      feature: 'support.resources-treemap',
      pageTitle: gettext('Resources usage'),
    },
    resolve: {
      permission: checkPermission,
    },
  },

  {
    name: 'support.shared-providers',
    url: 'shared-providers/',
    component: SharedProviderContainer,
    data: {
      feature: 'support.shared-providers',
      pageTitle: gettext('Shared providers'),
    },
    resolve: {
      permission: checkPermission,
    },
  },
];
