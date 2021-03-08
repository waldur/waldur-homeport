import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { getDefaultResourceTabs } from '@waldur/resource/tabs/constants';
import { ResourceTabsConfiguration } from '@waldur/resource/tabs/ResourceTabsConfiguration';

const AllocationUsageTable = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SlurmAllocationUsageTable" */ './details/AllocationUsageTable'
    ),
  'AllocationUsageTable',
);

const AllocationUsersTable = lazyComponent(
  () =>
    import(
      /* webpackChunkName: "SlurmAllocationUsersTable" */ './details/AllocationUsersTable'
    ),
  'AllocationUsersTable',
);

ResourceTabsConfiguration.register('SLURM.Allocation', () => [
  {
    key: 'usage',
    title: translate('Usage'),
    component: AllocationUsageTable,
  },
  ...getDefaultResourceTabs(),
  {
    key: 'users',
    title: translate('Users'),
    component: AllocationUsersTable,
  },
]);
