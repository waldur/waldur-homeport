import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

import { AllocationUsageTable } from './details/AllocationUsageTable';

ResourceTabsConfiguration.register('SLURM.Allocation', () => [
  {
    key: 'usage',
    title: translate('Usage'),
    component: AllocationUsageTable,
  },
  ...getDefaultResourceTabs(),
]);
