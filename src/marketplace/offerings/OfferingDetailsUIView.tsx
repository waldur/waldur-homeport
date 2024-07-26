import { useQuery } from '@tanstack/react-query';
import { UIView, useCurrentStateAndParams } from '@uirouter/react';
import { useMemo } from 'react';
import { useEffectOnce } from 'react-use';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import {
  getCategory,
  getOfferingPlansUsage,
  getProviderOffering,
} from '@waldur/marketplace/common/api';
import { Offering } from '@waldur/marketplace/types';
import { useBreadcrumbs, usePageHero } from '@waldur/navigation/context';
import { useTitle } from '@waldur/navigation/title';
import { PageBarTab } from '@waldur/navigation/types';
import { usePageTabsTransmitter } from '@waldur/navigation/utils';

import { isExperimentalUiComponentsVisible } from '../utils';

import { OfferingViewHero } from './OfferingViewHero';
import { getOfferingBreadcrumbItems } from './utils';

const OfferingDetailsStatistics = lazyComponent(
  () =>
    import('@waldur/marketplace/offerings/details/OfferingDetailsStatistics'),
  'OfferingDetailsStatistics',
);
const OfferingBookingResourcesCalendarContainer = lazyComponent(
  () =>
    import(
      '@waldur/booking/offering/OfferingBookingResourcesCalendarContainer'
    ),
  'OfferingBookingResourcesCalendarContainer',
);
const OfferingResourcesList = lazyComponent(
  () => import('../details/OfferingResourcesList'),
  'OfferingResourcesList',
);
const OfferingOrdersList = lazyComponent(
  () => import('./details/OfferingOrdersList'),
  'OfferingOrdersList',
);
const PlanUsageList = lazyComponent(
  () => import('./details/PlanUsageList'),
  'PlanUsageList',
);
const OfferingUsersTable = lazyComponent(
  () => import('./details/OfferingUsersTable'),
  'OfferingUsersTable',
);
const OfferingPermissionsList = lazyComponent(
  () => import('./details/permissions/OfferingPermissionsList'),
  'OfferingPermissionsList',
);
const OfferingCustomersList = lazyComponent(
  () => import('./expandable/OfferingCustomersList'),
  'OfferingCustomersList',
);
const OfferingCostsChart = lazyComponent(
  () => import('./expandable/OfferingCostsChart'),
  'OfferingCostsChart',
);
const OfferingUsageChart = lazyComponent(
  () => import('./expandable/OfferingUsageChart'),
  'OfferingUsageChart',
);
const OfferingEventsList = lazyComponent(
  () => import('./expandable/OfferingEventsList'),
  'OfferingEventsList',
);

async function loadData(offering_uuid: string) {
  const [offering, plansUsage] = await Promise.all([
    getProviderOffering(offering_uuid),
    getOfferingPlansUsage(offering_uuid),
  ]);
  const category = await getCategory(offering.category_uuid);

  return { offering, category, plansUsage };
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
    {
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
      title: translate('Events'),
      key: 'events',
      component: OfferingEventsList,
    },
  ].filter(Boolean);
};

export const OfferingDetailsUIView = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const { isLoading, error, data, refetch, isRefetching } = useQuery(
    ['providerOfferingDetail', offering_uuid],
    () => loadData(offering_uuid),
    { enabled: false },
  );

  useEffectOnce(() => {
    refetch();
  });

  useTitle(data ? data.offering?.name : translate('Offering details'));

  const tabs = useMemo(
    () => (data?.offering ? getTabs(data.offering) : []),
    [data?.offering],
  );
  const { tabSpec } = usePageTabsTransmitter(tabs);

  usePageHero(
    <OfferingViewHero
      offeringUuid={offering_uuid}
      refetch={refetch}
      isRefetching={isRefetching}
    />,
    [offering_uuid, refetch, isRefetching],
  );

  const breadcrumbItems = useMemo(
    () => getOfferingBreadcrumbItems(data?.offering),
    [data?.offering],
  );
  useBreadcrumbs(breadcrumbItems);

  return (
    <UIView
      render={(Component, { key, ...props }) => (
        <Component
          {...props}
          key={key}
          refetch={refetch}
          data={data}
          isLoading={isLoading}
          error={error}
          tabSpec={tabSpec}
        />
      )}
    />
  );
};
