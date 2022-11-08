import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';
import { useBookingsCalendarProps } from '@waldur/customer/dashboard/utils';
import { translate } from '@waldur/i18n';
import {
  getProviderOfferingsCount,
  getResourcesCount,
} from '@waldur/marketplace/common/api';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

const loadBookingOfferingsCount = (customerUuid: string, projectUuid: string) =>
  getProviderOfferingsCount({
    params: {
      customer_uuid: customerUuid,
      project_uuid: projectUuid,
      type: OFFERING_TYPE_BOOKING,
      state: ['Active', 'Paused'],
    },
  });

const loadBookingResourcesCount = (customerUuid: string, projectUuid: string) =>
  getResourcesCount({
    params: {
      customer_uuid: customerUuid,
      project_uuid: projectUuid,
      offering_type: OFFERING_TYPE_BOOKING,
    },
  });

const loadData = async (customer: Customer, projectUuid: string) => {
  const offeringsCount = customer.is_service_provider
    ? await loadBookingOfferingsCount(customer.uuid, projectUuid)
    : null;
  const resourcesCount = await loadBookingResourcesCount(
    customer.uuid,
    projectUuid,
  );
  return { offeringsCount, resourcesCount };
};

export const CustomerBookingManagement: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  const bookingsCalendarProps = useBookingsCalendarProps();
  const { loading, value, error } = useAsync(
    () => loadData(customer, project?.uuid),
    [customer, project],
  );
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
        projectUuid={project?.uuid}
        {...bookingsCalendarProps}
      />
      <BookingsFilter />
      <BookingsList customerUuid={customer.uuid} projectUuid={project?.uuid} />
    </Panel>
  ) : null;
};
