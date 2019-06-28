import * as React from 'react';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Query } from '@waldur/core/Query';
import { $state, ngInjector } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { getOffering, getCategory } from '@waldur/marketplace/common/api';
import { getTabs } from '@waldur/marketplace/details/OfferingTabs';
import { Offering } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { OfferingBookingTab } from './OfferingBookingTab';
import { OfferingDetails } from './OfferingDetails';
import { PlanUsageList } from './PlanUsageList';

function updateBreadcrumbs(offering: Offering) {
  const $timeout = ngInjector.get('$timeout');
  const BreadcrumbsService = ngInjector.get('BreadcrumbsService');
  const titleService = ngInjector.get('titleService');

  $timeout(() => {
    BreadcrumbsService.activeItem = offering.name;
    BreadcrumbsService.items = [
      {
        label: translate('Organization workspace'),
        state: 'organization.details',
      },
      {
        label: translate('My services'),
      },
      offering.shared ? {
        label: translate('Public offerings'),
        state: 'marketplace-vendor-offerings',
      } : {
        label: translate('My offerings'),
        state: 'marketplace-my-offerings',
      },
    ];
    titleService.setTitle(offering.name);
  });
}

// tslint:disable-next-line: variable-name
async function loadData(offering_uuid: string) {
  const offering = await getOffering(offering_uuid);
  const category = await getCategory(offering.category_uuid);
  const sections = category.sections;

  const tabs = [
    ...getTabs({offering, sections}),
    {
      visible: offering.billable,
      title: translate('Plan capacity'),
      component: () => <PlanUsageList offering_uuid={offering.uuid}/>,
    },
    {
      title: translate('Bookings'),
      component: () => <OfferingBookingTab offering={offering}/>,
      visible: offering.type === OFFERING_TYPE_BOOKING,
    },
  ].filter(tab => tab.visible);
  updateBreadcrumbs(offering);
  return { offering, tabs };
}

export const OfferingContainer = () => (
  <Query loader={loadData} variables={$state.params.offering_uuid}>
    {({ loading, data, error }) => {
      if (loading) {
        return <LoadingSpinner/>;
      }
      if (error) {
        return <h3>{translate('Unable to load offering details.')}</h3>;
      }
      return (
        <OfferingDetails offering={data.offering} tabs={data.tabs}/>
      );
    }}
  </Query>
);

export default connectAngularComponent(OfferingContainer);
