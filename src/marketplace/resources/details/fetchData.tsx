import {
  marketplaceResourcesDetailsRetrieve,
  marketplaceResourcesOfferingRetrieve,
  PublicOfferingDetails,
  Resource,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import {
  MarketplaceFeatures,
  OpenstackFeatures,
  SlurmFeatures,
} from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import { countLexisLinks, countRobotAccounts } from '@/marketplace/common/api';
import { PageBarTab } from '@/navigation/types';
import { INSTANCE_TYPE, TENANT_TYPE } from '@/openstack/constants';
import { MARKETPLACE_RANCHER } from '@/rancher/cluster/create/constants';
import { getTabs } from '@/resource/tabs/registry';
import { getResourceAccessEndpoints } from '@/resource/utils';
import { SLURM_PLUGIN } from '@/slurm/constants';

export const getResourceTabs = ({
  resource,
  offering,
  scope,
  lexisLinksCount,
  robotAccountsCount,
  isStaff,
  isSupport,
  isRPOnly = false,
}: {
  resource: Resource;
  offering: PublicOfferingDetails;
  scope;
  lexisLinksCount;
  robotAccountsCount;
  isStaff: boolean;
  isSupport?: boolean;
  isRPOnly?: boolean;
}) => {
  // Generate tabs
  const tabs: PageBarTab<{
    resource: Resource;
    resourceScope;
    nestedScope?;
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
        import('@/slurm/details/AllocationUsersTable').then((module) => ({
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
          import('@/slurm/details/AllocationJobsTable').then((module) => ({
            default: module.AllocationJobsTable,
          })),
        ),
      });
    }
  } else if ([MARKETPLACE_RANCHER].includes(resource.offering_type) && scope) {
    tabs.push({
      key: 'dashboard',
      title: translate('Dashboard'),
      component: lazyComponent(() =>
        import('@/rancher/cluster/dashboard/ClusterDashboard').then(
          (module) => ({
            default: module.ClusterDashboard,
          }),
        ),
      ),
    });
    if (resource.offering_type === MARKETPLACE_RANCHER) {
      tabs.push({
        key: 'security_groups',
        title: translate('Security groups'),
        component: lazyComponent(() =>
          import('@/rancher/cluster/ClusterSecurityGroupsList').then(
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
        import('@/marketplace/robot-accounts/RobotAccountCard').then(
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

  if ((offering.plugin_options as any)?.enable_resource_projects) {
    tabs.push({
      key: 'team',
      title: translate('Team'),
      component: lazyComponent(() =>
        import('@/marketplace/resources/users/ResourceTeamTab').then(
          (module) => ({
            default: module.ResourceTeamTab,
          }),
        ),
      ),
    });
    tabs.push({
      key: 'resource-projects',
      title: translate('Resource projects'),
      component: lazyComponent(() =>
        import('@/marketplace/resources/projects/ResourceProjectsList').then(
          (module) => ({
            default: module.ResourceProjectsList,
          }),
        ),
      ),
    });
  } else if ((offering.plugin_options as any)?.keycloak_enabled) {
    tabs.push({
      key: 'users',
      title: translate('Roles'),
      component: lazyComponent(() =>
        import('@/marketplace/offerings/keycloak/OfferingKeycloakMembershipList').then(
          (module) => ({
            default: module.OfferingKeycloakMembershipList,
          }),
        ),
      ),
    });
  }

  if (
    !isFeatureVisible(MarketplaceFeatures.conceal_resource_metadata) ||
    isStaff
  ) {
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
        ...(!isFeatureVisible(
          MarketplaceFeatures.conceal_audit_log_from_end_users,
        ) ||
        isStaff ||
        isSupport
          ? [
              {
                key: 'activity',
                title: translate('Audit logs'),
                component: lazyComponent(() =>
                  import('./ActivityCard').then((module) => ({
                    default: module.ActivityCard,
                  })),
                ),
              },
            ]
          : []),
        {
          key: 'order-history',
          title: translate('Order history'),
          component: lazyComponent(() =>
            import('@/marketplace/orders/list/ResourceOrders').then(
              (module) => ({
                default: module.ResourceOrders,
              }),
            ),
          ),
        },
      ],
    });
  }

  if (
    resource.offering_type === TENANT_TYPE &&
    scope &&
    isFeatureVisible(OpenstackFeatures.show_migrations)
  ) {
    tabs.push({
      key: 'replications',
      title: translate('Replications'),
      component: lazyComponent(() =>
        import('@/openstack/openstack-tenant/TenantMigrationsList').then(
          (module) => ({ default: module.TenantMigrationsList }),
        ),
      ),
    });
  }
  if (resource.offering_type === MARKETPLACE_RANCHER) {
    tabs.push({
      key: 'longhorn',
      title: translate('Longhorn'),
      component: lazyComponent(() =>
        import('@/rancher/cluster/ClusterLonghornTab').then((module) => ({
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

  const showIssues = hasSupport();
  if (showIssues) {
    tabs.push({
      key: 'support',
      title: translate('Support'),
      component: lazyComponent(() =>
        import('./ResourceIssuesCard').then((module) => ({
          default: module.ResourceIssuesCard,
        })),
      ),
    });
  }

  if (isRPOnly) {
    // ResourceProject-only viewers get a minimal subset: a way to land on the
    // page (Getting started), navigate to "their" sub-project, and reach
    // support. Everything else (quotas, usage, metadata, team, invitations,
    // resource-type-specific dashboards) is hidden.
    const RP_ONLY_TAB_KEYS = new Set([
      'getting-started',
      'resource-projects',
      'support',
    ]);
    return tabs.filter((tab) => RP_ONLY_TAB_KEYS.has(tab.key));
  }

  return tabs;
};

export const fetchData = async (resource: Resource) => {
  let scope;
  if (resource.scope) {
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
