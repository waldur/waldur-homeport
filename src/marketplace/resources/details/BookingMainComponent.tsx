import { useContext, useEffect } from 'react';
import { Card } from 'react-bootstrap';

import { BookingResourcesCalendar } from '@waldur/booking/offering/BookingResourcesCalendar';
import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';

export const BookingMainComponent = ({ resource, refetch, activeTab }) => {
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    addTabs([
      {
        key: 'booking',
        title: translate('Booking'),
        priority: 12,
      },
    ]);
  });
  return (
    <Card
      className={
        activeTab === 'booking'
          ? 'resource-bookings mb-10'
          : 'resource-bookings d-none'
      }
      id="booking"
    >
      <Card.Header>
        <Card.Title>{translate('Bookings')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <BookingResourcesCalendar
          bookingResources={[resource]}
          refetch={refetch}
        />
      </Card.Body>
    </Card>
  );
};
