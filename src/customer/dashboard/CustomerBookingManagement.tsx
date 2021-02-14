import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';
import { useBookingsCalendarProps } from '@waldur/customer/dashboard/utils';
import { translate } from '@waldur/i18n';
import {
  getOfferingsCount,
  getResourcesCount,
} from '@waldur/marketplace/common/api';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

const loadBookingOfferingsCount = (customerUuid: string) =>
  getOfferingsCount({
    params: {
      customer_uuid: customerUuid,
      type: 'Marketplace.Booking',
      state: ['Active', 'Paused'],
    },
  });

const loadBookingResourcesCount = (customerUuid: string) =>
  getResourcesCount({
    params: {
      customer_uuid: customerUuid,
      type: 'Marketplace.Booking',
    },
  });

const loadData = async (customer: Customer) => {
  const offeringsCount = customer.is_service_provider
    ? await loadBookingOfferingsCount(customer.uuid)
    : null;
  const resourcesCount = await loadBookingResourcesCount(customer.uuid);
  return { offeringsCount, resourcesCount };
};

export const CustomerBookingManagement: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const bookingsCalendarProps = useBookingsCalendarProps();
  const { loading, value, error } = useAsync(() => loadData(customer), [
    customer,
  ]);
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <h3>{translate('Unable to load booking offerings.')}</h3>;
  }
  return (value.offeringsCount && customer.is_service_provider) ||
    value.resourcesCount ? (
    <Panel title={translate('Booking management')}>
      <BookingsCalendar
        customerUuid={customer.uuid}
        isServiceProvider={customer.is_service_provider}
        {...bookingsCalendarProps}
      />
      <BookingsFilter />
      <BookingsList
        customerUuid={customer.uuid}
        isServiceProvider={customer.is_service_provider}
      />
    </Panel>
  ) : null;
};
