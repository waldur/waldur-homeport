import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useCallback, useMemo } from 'react';
import {
  marketplaceCategoriesRetrieve,
  marketplacePlansUsageStatsList,
  marketplaceProviderOfferingsRetrieve,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { getAllPages } from '@waldur/core/api';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';
import { Offering, ServiceProvider } from '@waldur/marketplace/types';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/usePageTabsTransmitter';

import { isExperimentalUiComponentsVisible } from '../utils';

import { PROVIDER_OFFERING_DATA_QUERY_KEY } from './constants';
import { getOfferingBreadcrumbItems } from './hooks';
import { OfferingViewHero } from './OfferingViewHero';

const OfferingDetailsStatistics = lazyComponent(() =>
  import(
    '@waldur/marketplace/offerings/details/OfferingDetailsStatistics'
  ).then((module) => ({ default: module.OfferingDetailsStatistics })),
);
const OfferingBookingResourcesCalendarContainer = lazyComponent(() =>
  import(
    '@waldur/booking/offering/OfferingBookingResourcesCalendarContainer'
  ).then((module) => ({
    default: module.OfferingBookingResourcesCalendarContainer,
  })),
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
const OfferingCustomersList = lazyComponent(() =>
  import('./expandable/OfferingCustomersList').then((module) => ({
    default: module.OfferingCustomersList,
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

async function loadOfferingData(offering_uuid: string) {
  const offering = (await marketplaceProviderOfferingsRetrieve({
    path: { uuid: offering_uuid },
  }).then((response) => response.data)) as Offering;
  const category = await marketplaceCategoriesRetrieve({
    path: { uuid: offering.category_uuid },
  }).then((response) => response.data);

  return { offering, category };
}

const getTabs = (offering: Offering): PageBarTab[] => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();
  return [
    showExperimentalUiComponents
      ? {
          title: translate('Statistics'),
          key: 'statistics',
          component: OfferingDetailsStatistics,
        }
      : null,
    offering.type === OFFERING_TYPE_BOOKING
      ? {
          title: translate('Bookings'),
          key: 'bookings',
          component: OfferingBookingResourcesCalendarContainer,
        }
      : null,
    {
      title: translate('Resources'),
      key: 'resources',
      component: OfferingResourcesList,
    },
    !isFeatureVisible(MarketplaceFeatures.catalogue_only) && {
      title: translate('Orders'),
      key: 'orders',
      component: OfferingOrdersList,
    },
    offering.type !== OFFERING_TYPE_BOOKING && offering.billable
      ? { title: translate('Plans'), key: 'plans', component: PlanUsageList }
      : null,
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
      title: translate('Organizations'),
      key: 'organizations',
      component: OfferingCustomersList,
    },
    {
      title: translate('Costs'),
      key: 'costs',
      component: OfferingCostsChart,
    },
    offering.components.length > 0
      ? {
          title: translate('Component usage'),
          key: 'component-usage',
          component: OfferingUsageChart,
        }
      : null,
    {
      title: translate('Policy'),
      key: 'policy',
      defaultKey: 'cost-policy',
      children: [
        {
          key: 'cost-policy',
          title: translate('Cost policy'),
          component: OfferingCostPolicies,
          visible: false,
        },
        {
          key: 'usage-policy',
          title: translate('Usage policy'),
          component: OfferingUsagePolicies,
          visible: false,
        },
      ],
    },
    {
      title: translate('Events'),
      key: 'events',
      component: OfferingEventsList,
    },
  ].filter(Boolean);
};

export const OfferingDetailsUIView = ({
  provider,
}: {
  provider: ServiceProvider;
}) => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const {
    isLoading: isLoadingOffering,
    error: errorOffering,
    data: offeringData,
    refetch: refetchOffering,
    isRefetching: isRefetchingOffering,
  } = useQuery({
    queryKey: [PROVIDER_OFFERING_DATA_QUERY_KEY, offering_uuid],
    queryFn: () => loadOfferingData(offering_uuid),
    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
  });
  const {
    isLoading: isLoadingPlansUsage,
    error: errorPlansUsage,
    data: plansUsage,
    refetch: refetchPlansUsage,
    isRefetching: isRefetchingPlansUsage,
  } = useQuery({
    queryKey: ['offeringPlansUsage', offering_uuid],

    queryFn: () =>
      getAllPages((page) =>
        marketplacePlansUsageStatsList({
          query: { page, offering_uuid },
        }),
      ),

    refetchOnWindowFocus: false,
    staleTime: 3 * 60 * 1000,
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

  usePageHero(
    <OfferingViewHero
      offering={offeringData?.offering}
      refetch={refetch}
      isRefetching={isRefetchingOffering || isRefetchingPlansUsage}
      isLoading={isLoadingOffering}
      error={errorOffering}
    />,

    [
      offeringData?.offering,
      refetch,
      isRefetchingOffering,
      isRefetchingPlansUsage,
      isLoadingOffering,
      errorOffering,
    ],
  );

  const breadcrumbItems = useMemo(
    () =>
      getOfferingBreadcrumbItems(offeringData?.offering, provider, 'details'),
    [offeringData?.offering],
  );
  useBreadcrumbs(breadcrumbItems);

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
