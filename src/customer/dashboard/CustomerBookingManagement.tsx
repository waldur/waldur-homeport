import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';

import { BookingsFilter } from '@waldur/booking/BookingsFilter';
import { BookingsList } from '@waldur/booking/BookingsList';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Panel } from '@waldur/core/Panel';
import { BookingsCalendar } from '@waldur/customer/dashboard/BookingsCalendar';
import { translate } from '@waldur/i18n';
import { getOfferingsCount } from '@waldur/marketplace/common/api';
import { getCustomer } from '@waldur/workspace/selectors';

const loadBookingOfferingsCount = async (customerUuid: string) =>
  await getOfferingsCount({
    params: {
      customer_uuid: customerUuid,
      type: 'Marketplace.Booking',
      state: ['Active', 'Paused'],
    },
  });

export const CustomerBookingManagement: FunctionComponent = () => {
  const customer = useSelector(getCustomer);
  const { loading, value: offeringsCount, error } = useAsync(
    () => loadBookingOfferingsCount(customer.uuid),
    [customer],
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <h3>{translate('Unable to load booking offerings.')}</h3>;
  }
  return customer.is_service_provider && offeringsCount ? (
    <Panel title={translate('Booking management')}>
      <Row style={{ marginBottom: '30px' }}>
        <Col md={8} mdOffset={2}>
          <BookingsCalendar providerUuid={customer.uuid} />
        </Col>
      </Row>
      <BookingsFilter />
      <BookingsList providerUuid={customer.uuid} />
    </Panel>
  ) : null;
};
