import * as React from 'react';
import { useSelector } from 'react-redux';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { Panel } from '@waldur/core/Panel';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';
import { translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

export const CustomerBookingManagement = () => {
  const customer = useSelector(getCustomer);
  return customer.is_service_provider ? (
    <Panel title={translate('Booking management')}>
      <BookingsCalendar providerUuid={customer.uuid} />
      <BookingsFilter />
      <BookingsList providerUuid={customer.uuid} />
    </Panel>
  ) : null;
};
