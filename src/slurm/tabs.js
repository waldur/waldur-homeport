import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { angular2react } from '@waldur/shims/angular2react';

const SlurmAllocationUsageTable = angular2react('slurmAllocationUsageTable', [
  'resource',
]);
// @ngInject
export default function tabsConfig(ResourceTabsConfigurationProvider) {
  ResourceTabsConfigurationProvider.register('SLURM.Allocation', () => [
    {
      key: 'usage',
      title: translate('Usage'),
      component: SlurmAllocationUsageTable,
    },
    ...getDefaultResourceTabs(),
  ]);
}
