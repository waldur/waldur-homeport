import {
  marketplaceResourcesDetailsRetrieve,
  marketplaceResourcesOfferingRetrieve,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import {
  MarketplaceFeatures,
  OpenstackFeatures,
  SlurmFeatures,
} from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { hasSupport } from '@waldur/issues/hooks';
import {
  countLexisLinks,
  countRobotAccounts,
} from '@waldur/marketplace/common/api';
import { PageBarTab } from '@waldur/navigation/types';
import { INSTANCE_TYPE, TENANT_TYPE } from '@waldur/openstack/constants';
import {
  MANAGED_RANCHER,
  MARKETPLACE_RANCHER,
} from '@waldur/rancher/cluster/create/constants';
import { getTabs } from '@waldur/resource/tabs/registry';
import { getResourceAccessEndpoints } from '@waldur/resource/utils';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';

export const getResourceTabs = ({
  resource,
  offering,
  scope,
  lexisLinksCount,
  robotAccountsCount,
}: {
  resource: Resource;
  offering: PublicOfferingDetails;
  scope;
  lexisLinksCount;
  robotAccountsCount;
}) => {
  // Generate tabs
  const tabs: PageBarTab<{
    resource: Resource;
    resourceScope;
    scope;
    offering: PublicOfferingDetails;
    refetch: () => void;
  }>[] = [];

  const endpoints = getResourceAccessEndpoints(resource, offering);
  if (offering.getting_started || endpoints.length > 0) {
    tabs.push({
      key: 'getting-started',
      title: translate('Getting started'),
      component: lazyComponent(() =>
        import('./GettingStartedCard').then((module) => ({
          default: module.GettingStartedCard,
        })),
      ),
    });
  }

  if (resource.offering_type === TENANT_TYPE && scope) {
    tabs.push({
      key: 'quotas',
      title: translate('Quotas'),
      component: lazyComponent(() =>
        import('./TenantMainComponent').then((module) => ({
          default: module.TenantMainComponent,
        })),
      ),
    });
  } else if (resource.offering_type === INSTANCE_TYPE && scope) {
    tabs.push({
      key: 'vm-details',
      title: translate('Details'),
      component: lazyComponent(() =>
        import('./openstack-instance/InstanceMainComponent').then((module) => ({
          default: module.InstanceMainComponent,
        })),
      ),
    });
  } else if (resource.offering_type === OFFERING_TYPE_BOOKING) {
    tabs.push({
      key: 'booking',
      title: translate('Booking'),
      component: lazyComponent(() =>
        import('./BookingMainComponent').then((module) => ({
          default: module.BookingMainComponent,
        })),
      ),
    });
  } else if (resource.offering_type === SLURM_PLUGIN && scope) {
    tabs.push({
      key: 'allocation-users',
      title: translate('Allocation users'),
      component: lazyComponent(() =>
        import('@waldur/slurm/details/AllocationUsersTable').then((module) => ({
          default: module.AllocationUsersTable,
        })),
      ),
    });
    const isSlurmJobsVisible = isFeatureVisible(SlurmFeatures.jobs);
    if (isSlurmJobsVisible) {
      tabs.push({
        key: 'jobs',
        title: translate('Jobs'),
        component: lazyComponent(() =>
          import('@waldur/slurm/details/AllocationJobsTable').then(
            (module) => ({
              default: module.AllocationJobsTable,
            }),
          ),
        ),
      });
    }
  } else if (
    [MARKETPLACE_RANCHER, MANAGED_RANCHER].includes(resource.offering_type) &&
    scope
  ) {
    tabs.push({
      key: 'dashboard',
      title: translate('Dashboard'),
      component: lazyComponent(() =>
        import('@waldur/rancher/cluster/dashboard/ClusterDashboard').then(
          (module) => ({
            default: module.ClusterDashboard,
          }),
        ),
      ),
    });
    if (resource.offering_type === MANAGED_RANCHER) {
      tabs.push({
        key: 'security_groups',
        title: translate('Security groups'),
        component: lazyComponent(() =>
          import('@waldur/rancher/cluster/ClusterSecurityGroupsList').then(
            (module) => ({
              default: module.ClusterSecurityGroupsList,
            }),
          ),
        ),
      });
    }
  }

  if (scope) {
    tabs.push(...(getTabs(scope.resource_type) as any));
  }

  if (lexisLinksCount) {
    tabs.push({
      key: 'lexis-links',
      title: translate('LEXIS links'),
      component: lazyComponent(() =>
        import('../lexis/LexisLinkCard').then((module) => ({
          default: module.LexisLinkCard,
        })),
      ),
    });
  }

  if (robotAccountsCount) {
    tabs.push({
      key: 'robot-accounts',
      title: translate('Robot accounts'),
      component: lazyComponent(() =>
        import('@waldur/marketplace/robot-accounts/RobotAccountCard').then(
          (module) => ({ default: module.RobotAccountCard }),
        ),
      ),
    });
  }

  if (resource.is_usage_based || resource.is_limit_based) {
    tabs.push({
      key: 'usage-history',
      title: translate('Usage'),
      component: lazyComponent(() =>
        import('./UsageCard').then((module) => ({ default: module.UsageCard })),
      ),
    });
  }

  const showIssues = hasSupport();
  if (showIssues) {
    tabs.push({
      key: 'requests',
      title: translate('Requests'),
      component: lazyComponent(() =>
        import('./ResourceIssuesCard').then((module) => ({
          default: module.ResourceIssuesCard,
        })),
      ),
    });
  }

  if (offering.resource_options?.order?.length) {
    tabs.push({
      key: 'resource-options',
      title: translate('Options'),
      component: lazyComponent(() =>
        import('../options/ResourceOptionsCard').then((module) => ({
          default: module.ResourceOptionsCard,
        })),
      ),
    });
  }

  if (offering.roles?.length > 0) {
    tabs.push({
      key: 'users',
      title: translate('Roles'),
      component: lazyComponent(() =>
        import('../users/ResourceUsersList').then((module) => ({
          default: module.ResourceUsersList,
        })),
      ),
    });
  }

  tabs.push({
    key: 'metadata',
    title: translate('Resource metadata'),
    children: [
      {
        key: 'resource-details',
        title: translate('Resource details'),
        component: lazyComponent(() =>
          import('./ResourceMetadataCard').then((module) => ({
            default: module.ResourceMetadataCard,
          })),
        ),
      },
      {
        key: 'activity',
        title: translate('Audit logs'),
        component: lazyComponent(() =>
          import('./ActivityCard').then((module) => ({
            default: module.ActivityCard,
          })),
        ),
      },
      {
        key: 'order-history',
        title: translate('Order history'),
        component: lazyComponent(() =>
          import('@waldur/marketplace/orders/list/ResourceOrders').then(
            (module) => ({
              default: module.ResourceOrders,
            }),
          ),
        ),
      },
    ],
  });

  if (
    resource.offering_type === TENANT_TYPE &&
    scope &&
    isFeatureVisible(OpenstackFeatures.show_migrations)
  ) {
    tabs.push({
      key: 'replications',
      title: translate('Replications'),
      component: lazyComponent(() =>
        import('@waldur/openstack/openstack-tenant/TenantMigrationsList').then(
          (module) => ({ default: module.TenantMigrationsList }),
        ),
      ),
    });
  }
  if (resource.offering_type === MANAGED_RANCHER) {
    tabs.push({
      key: 'longhorn',
      title: translate('Longhorn'),
      component: lazyComponent(() =>
        import('@waldur/rancher/cluster/ClusterLonghornTab').then((module) => ({
          default: module.ClusterLonghornTab,
        })),
      ),
    });
  }
  if (resource.report?.length > 0) {
    tabs.push({
      key: 'report',
      title: translate('Report'),
      component: lazyComponent(() =>
        import('./ShowReportCard').then((module) => ({
          default: module.ShowReportCard,
        })),
      ),
    });
  }
  return tabs;
};

export const fetchData = async (resource: Resource) => {
  let scope;
  if (resource.scope) {
    if (resource.offering_type === MANAGED_RANCHER) {
      resource = (
        await marketplaceResourcesDetailsRetrieve({
          path: { uuid: resource.uuid },
        })
      ).data;
    }
    scope = (
      await marketplaceResourcesDetailsRetrieve({
        path: { uuid: resource.uuid },
      })
    ).data;
  }
  const offering = await marketplaceResourcesOfferingRetrieve({
    path: { uuid: resource.uuid },
  }).then((response) => response.data);
  const components = offering.components;

  let lexisLinksCount = 0;
  if (isFeatureVisible(MarketplaceFeatures.lexis_links)) {
    lexisLinksCount = await countLexisLinks({
      resource_uuid: resource.uuid,
    });
  }
  const robotAccountsCount = await countRobotAccounts({
    resource: resource.url,
  });

  return {
    scope,
    components,
    offering,
    lexisLinksCount,
    robotAccountsCount,
  };
};
