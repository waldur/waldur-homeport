import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { NestedResourceTabsConfiguration } from '@waldur/resource/tabs/NestedResourceTabsConfiguration';

const AllocationUsersTable = lazyComponent(
  () => import('./details/AllocationUsersTable'),
  'AllocationUsersTable',
);

const AllocationJobsTable = lazyComponent(
  () => import('./details/AllocationJobsTable'),
  'AllocationJobsTable',
);

NestedResourceTabsConfiguration.register('SLURM.Allocation', () => [
  {
    title: translate('Details'),
    children: [
      {
        key: 'users',
        title: translate('Users'),
        component: AllocationUsersTable,
      },
      ...(isFeatureVisible('slurm.jobs')
        ? [
            {
              key: 'jobs',
              title: translate('Jobs'),
              component: AllocationJobsTable,
            },
          ]
        : []),
    ],
  },
]);
