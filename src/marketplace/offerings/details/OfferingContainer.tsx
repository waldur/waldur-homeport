import { useCurrentStateAndParams } from '@uirouter/react';
import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { OfferingResourcesFilter } from '@waldur/marketplace/details/OfferingResourcesFilter';
import { OfferingResourcesList } from '@waldur/marketplace/details/OfferingResourcesList';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { Offering } from '@waldur/marketplace/types';
import { useBreadcrumbsFn } from '@waldur/navigation/breadcrumbs/store';
import { BreadcrumbItem } from '@waldur/navigation/breadcrumbs/types';
import { useTitle } from '@waldur/navigation/title';

import { OfferingBookingTab } from './OfferingBookingTab';
import { OfferingDetails } from './OfferingDetails';
import { PlanUsageList } from './PlanUsageList';

function getBreadcrumbs(offering: Offering): BreadcrumbItem[] {
  return [
    {
      label: translate('Organization workspace'),
      state: 'organization.details',
    },
    {
      label: translate('My services'),
    },
    offering.shared
      ? {
          label: translate('Public offerings'),
          state: 'marketplace-vendor-offerings',
        }
      : {
          label: translate('My offerings'),
          state: 'marketplace-my-offerings',
        },
  ];
}

async function loadData(offering_uuid: string) {
  const offering = await getOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;

  const tabs = [
    ...getTabs({ offering, sections }),
    {
      visible: offering.billable,
      title: translate('Plan capacity'),
      component: () => <PlanUsageList offering_uuid={offering.uuid} />,
    },
    {
      title: translate('Bookings'),
      component: () => <OfferingBookingTab offeringUuid={offering.uuid} />,
      visible: offering.type === OFFERING_TYPE_BOOKING,
    },
    {
      visible: true,
      title: translate('Resources'),
      component: () => (
        <>
          <OfferingResourcesFilter />
          <OfferingResourcesList offering={offering} />
        </>
      ),
    },
  ].filter((tab) => tab.visible);
  return { offering, tabs };
}

export const OfferingContainer = () => {
  const {
    params: { offering_uuid },
  } = useCurrentStateAndParams();

  const { loading, value, error } = useAsync(() => loadData(offering_uuid), [
    offering_uuid,
  ]);

  useBreadcrumbsFn(() => (value ? getBreadcrumbs(value.offering) : []), [
    value,
  ]);

  useTitle(value ? value.offering.name : translate('Offering details'));

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <h3>{translate('Unable to load offering details.')}</h3>;
  }

  return <OfferingDetails offering={value.offering} tabs={value.tabs} />;
};
