import {
  marketplaceResourcesDetailsRetrieve,
  marketplaceResourcesOfferingRetrieve,
  Offering,
  Resource,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures, OpenstackFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { hasSupport } from '@/issues/hooks';
import {
  countEndDateChangeRequests,
  countLexisLinks,
  countRobotAccounts,
} from '@/marketplace/common/api';
import { hasEditableLimitComponents } from '@/marketplace/resources/change-limits/utils';
import { isInferenceServiceEnabled } from '@/marketplace/resources/inference';
import { PageBarTab } from '@/navigation/types';
import { INSTANCE_TYPE, TENANT_TYPE } from '@/openstack/constants';
import { MARKETPLACE_RANCHER } from '@/rancher/cluster/create/constants';
import { getTabs } from '@/resource/tabs/registry';
import { getResourceAccessEndpoints } from '@/resource/utils';

function isOfferingLbaasEnabled(offering: Offering): boolean {
  return Boolean(
    (offering.plugin_options as { lbaas_enabled?: boolean } | undefined)
      ?.lbaas_enabled,
  );
}

export const getResourceTabs = ({
  resource,
  offering,
  scope,
  lexisLinksCount,
  robotAccountsCount,
  isStaff,
  isSupport,
  isRPOnly = false,
  canManageLimitRequests = false,
  canManageEndDateRequests = false,
  endDateChangeRequestsCount = 0,
}: {
  resource: Resource;
  offering: Offering;
  scope;
  lexisLinksCount;
  robotAccountsCount;
  isStaff: boolean;
  isSupport?: boolean;
  isRPOnly?: boolean;
  canManageLimitRequests?: boolean;
  canManageEndDateRequests?: boolean;
  endDateChangeRequestsCount?: number;
}) => {
  // Generate tabs
  const tabs: PageBarTab<{
    resource: Resource;
    resourceScope;
    nestedScope?;
    scope;
    offering: Offering;
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

  if (isInferenceServiceEnabled(resource)) {
    tabs.push({
      key: 'inference',
      title: translate('Inference'),
      component: lazyComponent(() =>
        import('./inference/InferenceServiceView').then((module) => ({
          default: module.InferenceServiceView,
        })),
      ),
    });
  }

  // Any backend that reports API keys gets the tab — the resource says whether it
  // owns any, so there is no offering type or flag for a provider to get wrong.
  // The cast goes away once a waldur-js-client carrying has_api_keys is published;
  // the field ships with the mastermind side of this change.
  if ((resource as Resource & { has_api_keys?: boolean }).has_api_keys) {
    tabs.push({
      key: 'api-keys',
      title: translate('API keys'),
      component: lazyComponent(() =>
        import('./api-keys/ResourceApiKeysTab').then((module) => ({
          default: module.ResourceApiKeysTab,
        })),
      ),
    });
  }

  if (scope) {
    const resourceTabs = getTabs(scope.resource_type) as any[];
    if (
      resource.offering_type === TENANT_TYPE &&
      !isOfferingLbaasEnabled(offering)
    ) {
      const filteredTabs = resourceTabs.map((tab) =>
        tab.key === 'networking'
          ? {
              ...tab,
              children: tab.children?.filter(
                (child: any) => child.key !== 'load_balancers',
              ),
            }
          : tab,
      );
      tabs.push(...filteredTabs);
    } else {
      tabs.push(...resourceTabs);
    }
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
  }

  if ((offering.plugin_options as any)?.enable_resource_access_subnets) {
    tabs.push({
      key: 'access-subnets',
      title: translate('Access subnets'),
      component: lazyComponent(() =>
        import('@/marketplace/resources/access-subnets/ResourceAccessSubnetsCard').then(
          (module) => ({
            default: module.ResourceAccessSubnetsCard,
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

  // Requests a consumer raises for someone to approve. Limits and end dates are
  // separate endpoints with separate permissions, so each is gated on its own
  // and they are grouped only when both are actually available — a dropdown
  // holding a single entry is worse than a plain tab, and one of the two is the
  // common case.
  const changeRequestTabs = [];

  // Show only when a limit change is actually feasible for this resource,
  // mirroring the conditions under which ChangeLimitsAction is usable:
  // editable limit components and an associated plan. This hides the tab on
  // child resources (e.g. OpenStack instances/volumes) that merely inherit the
  // parent offering's limit components but have no plan of their own.
  if (
    canManageLimitRequests &&
    hasEditableLimitComponents(offering) &&
    Boolean(resource.plan_uuid)
  ) {
    changeRequestTabs.push({
      key: 'limit-change-requests',
      groupedTitle: translate('Limits'),
      title: translate('Limit change requests'),
      component: lazyComponent(() =>
        import('@/marketplace/resources/request-limits-change/ResourceLimitChangeRequests').then(
          (module) => ({
            default: module.ResourceLimitChangeRequests,
          }),
        ),
      ),
    });
  }

  // Only offerings that accept end date change requests have anything to show
  // here, and only whoever may decide one sees the tab.
  if (
    (canManageEndDateRequests || endDateChangeRequestsCount > 0) &&
    offering?.plugin_options?.enable_resource_end_date_change_requests &&
    !offering?.components?.some((component) => component.is_prepaid)
  ) {
    changeRequestTabs.push({
      key: 'end-date-change-requests',
      groupedTitle: translate('End date'),
      title: translate('End date change requests'),
      component: lazyComponent(() =>
        import('@/marketplace/resources/request-end-date-change/ResourceEndDateChangeRequests').then(
          (module) => ({
            default: module.ResourceEndDateChangeRequests,
          }),
        ),
      ),
    });
  }

  if (changeRequestTabs.length === 1) {
    const [{ groupedTitle: _groupedTitle, ...tab }] = changeRequestTabs;
    tabs.push(tab);
  } else if (changeRequestTabs.length > 1) {
    tabs.push({
      key: 'change-requests',
      title: translate('Change requests'),
      // Child keys are unchanged, so existing ?tab= deep links keep working.
      defaultKey: changeRequestTabs[0].key,
      children: changeRequestTabs.map(({ groupedTitle, ...tab }) => ({
        ...tab,
        title: groupedTitle,
      })),
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

  // The requester is not an approver, so the tab is otherwise invisible to
  // them and they cannot tell what became of what they asked for. The list
  // endpoint already scopes rows to own-or-decidable, so counting without a
  // created_by filter answers "is there anything here for me?" for both.
  let endDateChangeRequestsCount = 0;
  if (offering?.plugin_options?.enable_resource_end_date_change_requests) {
    endDateChangeRequestsCount = await countEndDateChangeRequests({
      resource_uuid: resource.uuid,
    });
  }

  return {
    scope,
    components,
    offering,
    lexisLinksCount,
    robotAccountsCount,
    endDateChangeRequestsCount,
  };
};
