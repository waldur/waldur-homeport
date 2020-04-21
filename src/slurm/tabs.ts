import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';
import { angular2react } from '@waldur/shims/angular2react';

const SlurmAllocationUsageTable = angular2react('slurmAllocationUsageTable', [
  'resource',
]);

ResourceTabsConfiguration.register('SLURM.Allocation', () => [
  {
    key: 'usage',
    title: translate('Usage'),
    component: SlurmAllocationUsageTable,
  },
  ...getDefaultResourceTabs(),
]);
