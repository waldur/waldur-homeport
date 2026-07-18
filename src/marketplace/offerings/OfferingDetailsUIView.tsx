import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useMemo } from 'react';
import {
  marketplacePlansUsageStatsList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { MAX_PAGE_SIZE, getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { lazyComponent } from '@/core/lazyComponent';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';
import { PageBarTab } from '@/navigation/types';
import { usePageTabsTransmitter } from '@/navigation/usePageTabsTransmitter';
import { TENANT_TYPE } from '@/openstack/constants';

const OfferingDashboard = lazyComponent(() =>
  import('./details/dashboard/OfferingDashboard').then((module) => ({
    default: module.OfferingDashboard,
  })),
);
const OfferingBookingResourcesCalendarContainer = lazyComponent(() =>
  import('@/booking/offering/OfferingBookingResourcesCalendarContainer').then(
    (module) => ({
      default: module.OfferingBookingResourcesCalendarContainer,
    }),
  ),
);
const OfferingResourcesList = lazyComponent(() =>
  import('../details/OfferingResourcesList').then((module) => ({
    default: module.OfferingResourcesList,
  })),
);
const OfferingOrdersList = lazyComponent(() =>
  import('./details/OfferingOrdersList').then((module) => ({
    default: module.OfferingOrdersList,
  })),
);
const PlanUsageList = lazyComponent(() =>
  import('./details/PlanUsageList').then((module) => ({
    default: module.PlanUsageList,
  })),
);
const OfferingUsersTable = lazyComponent(() =>
  import('./details/OfferingUsersTable').then((module) => ({
    default: module.OfferingUsersTable,
  })),
);
const OfferingPermissionsList = lazyComponent(() =>
  import('./details/permissions/OfferingPermissionsList').then((module) => ({
    default: module.OfferingPermissionsList,
  })),
);
const OfferingCustomers = lazyComponent(() =>
  import('./details/OfferingCustomers').then((module) => ({
    default: module.OfferingCustomers,
  })),
);
const OfferingCostsChart = lazyComponent(() =>
  import('./expandable/OfferingCostsChart').then((module) => ({
    default: module.OfferingCostsChart,
  })),
);
const OfferingUsageChart = lazyComponent(() =>
  import('./expandable/OfferingUsageChart').then((module) => ({
    default: module.OfferingUsageChart,
  })),
);
const OfferingCostPolicies = lazyComponent(() =>
  import('./details/policies/OfferingCostPolicies').then((module) => ({
    default: module.OfferingCostPolicies,
  })),
);
const OfferingUsagePolicies = lazyComponent(() =>
  import('./details/policies/OfferingUsagePolicies').then((module) => ({
    default: module.OfferingUsagePolicies,
  })),
);
const OfferingEventsList = lazyComponent(() =>
  import('./expandable/OfferingEventsList').then((module) => ({
    default: module.OfferingEventsList,
  })),
);
const OfferingAccessSubnetsPanel = lazyComponent(() =>
  import('./details/OfferingAccessSubnetsPanel').then((module) => ({
    default: module.OfferingAccessSubnetsPanel,
  })),
);
const SlurmPolicySection = lazyComponent(() =>
  import('./update/policies/SlurmPolicySection').then((module) => ({
    default: module.SlurmPolicySection,
  })),
);
const TenantImagesTable = lazyComponent(() =>
  import('./openstack-tenant/TenantImagesTable').then((module) => ({
    default: module.TenantImagesTable,
  })),
);
const TenantFlavorsTable = lazyComponent(() =>
  import('./openstack-tenant/TenantFlavorsTable').then((module) => ({
    default: module.TenantFlavorsTable,
  })),
);
const TenantVolumeTypesTable = lazyComponent(() =>
  import('./openstack-tenant/TenantVolumeTypesTable').then((module) => ({
    default: module.TenantVolumeTypesTable,
  })),
);
const TenantServerGroupsTable = lazyComponent(() =>
  import('./openstack-tenant/TenantServerGroupsTable').then((module) => ({
    default: module.TenantServerGroupsTable,
  })),
);
const TenantHypervisorsTab = lazyComponent(() =>
  import('./openstack-tenant/TenantHypervisorsTab').then((module) => ({
    default: module.TenantHypervisorsTab,
  })),
);

const getTabs = (offering: Offering): PageBarTab[] => {
  return [
    {
      title: translate('Dashboard'),
      key: 'dashboard',
      component: OfferingDashboard,
    },
    offering.type === OFFERING_TYPE_BOOKING
      ? {
          title: translate('Bookings'),
          key: 'bookings',
          component: OfferingBookingResourcesCalendarContainer,
        }
      : null,
    offering.type === TENANT_TYPE
      ? {
          key: 'system_information',
          title: translate('System information'),
          defaultKey: 'images',
          children: [
            {
              key: 'images',
              component: TenantImagesTable,
              title: translate('Images'),
              visible: true,
            },
            {
              key: 'flavors',
              component: TenantFlavorsTable,
              title: translate('Flavors'),
              visible: true,
            },
            {
              key: 'volume-types',
              component: TenantVolumeTypesTable,
              title: translate('Volume types'),
              visible: true,
            },
            {
              key: 'server-groups',
              component: TenantServerGroupsTable,
              title: translate('Server groups'),
              visible: true,
            },
            {
              key: 'hypervisors',
              component: TenantHypervisorsTab,
              title: translate('Hypervisors'),
              visible: true,
            },
          ],
        }
      : null,
    {
      title: translate('Resources'),
      key: 'resources',
      defaultKey: 'resources-list',
      children: [
        {
          key: 'resources-list',
          title: translate('Resources'),
          component: OfferingResourcesList,
          visible: true,
        },
        !isFeatureVisible(MarketplaceFeatures.catalogue_only) && {
          key: 'orders',
          title: translate('Orders'),
          component: OfferingOrdersList,
          visible: true,
        },
        (offering.plugin_options as any)?.enable_resource_access_subnets && {
          key: 'resource-access-subnets',
          title: translate('Access subnets'),
          component: OfferingAccessSubnetsPanel,
          visible: true,
        },
      ].filter(Boolean),
    },
    {
      title: translate('Accounting'),
      key: 'accounting',
      defaultKey:
        offering.type !== OFFERING_TYPE_BOOKING && offering.billable
          ? 'plans'
          : 'costs',
      children: [
        offering.type !== OFFERING_TYPE_BOOKING && offering.billable
          ? {
              key: 'plans',
              title: translate('Plans'),
              component: PlanUsageList,
              visible: true,
            }
          : null,
        {
          key: 'costs',
          title: translate('Costs'),
          component: OfferingCostsChart,
          visible: true,
        },
        offering.components.length > 0
          ? {
              key: 'component-usage',
              title: translate('Component usage'),
              component: OfferingUsageChart,
              visible: true,
            }
          : null,
      ].filter(Boolean),
    },
    {
      title: translate('Users'),
      key: 'users',
      component: OfferingUsersTable,
    },
    {
      title: translate('Permissions'),
      key: 'permissions',
      component: OfferingPermissionsList,
    },
    {
      title: translate('Customers'),
      key: 'customers',
      component: OfferingCustomers,
    },
    {
      title: translate('Policy'),
      key: 'policy',
      defaultKey: 'cost-policy',
      children: [
        {
          key: 'cost-policy',
          title: translate('Cost policy'),
          component: OfferingCostPolicies,
          visible: true,
        },
        {
          key: 'usage-policy',
          title: translate('Usage policy'),
          component: OfferingUsagePolicies,
          visible: true,
        },
        offering.plugin_options?.slurm_periodic_policy_enabled
          ? {
              key: 'slurm-policy',
              title: translate('SLURM policy'),
              component: SlurmPolicySection,
              visible: true,
            }
          : null,
      ].filter(Boolean),
    },
    {
      title: translate('Events'),
      key: 'events',
      component: OfferingEventsList,
    },
  ].filter(Boolean);
};

export const OfferingDetailsUIView = ({
  offeringData,
  refetchOffering,
  isLoadingOffering,
  errorOffering,
}: {
  offeringData: any;
  refetchOffering: any;
  isLoadingOffering: boolean;
  errorOffering: any;
}) => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const {
    isLoading: isLoadingPlansUsage,
    error: errorPlansUsage,
    data: plansUsage,
    refetch: refetchPlansUsage,
  } = useQuery({
    queryKey: ['offeringPlansUsage', offering_uuid],

    queryFn: () =>
      getAllPages((page) =>
        marketplacePlansUsageStatsList({
          query: { page, page_size: MAX_PAGE_SIZE, offering_uuid },
        }),
      ),

    refetchOnWindowFocus: false,
    staleTime: UI_STALE_TIME,
  });

  const refetch = useCallback(() => {
    refetchOffering();
    refetchPlansUsage();
  }, [refetchOffering, refetchPlansUsage]);

  const tabs = useMemo(
    () => (offeringData?.offering ? getTabs(offeringData.offering) : []),
    [offeringData?.offering],
  );
  const { tabSpec } = usePageTabsTransmitter(tabs);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          key={key}
          {...props}
          refetch={refetch}
          data={{
            ...offeringData,
            plansUsage,
          }}
          isLoading={isLoadingOffering || isLoadingPlansUsage}
          error={errorOffering || errorPlansUsage}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
