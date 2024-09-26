import { Card } from 'react-bootstrap';

import { BookingResourcesCalendar } from '@waldur/booking/offering/BookingResourcesCalendar';
import { translate } from '@waldur/i18n';

export const BookingMainComponent = ({ resource, refetch }) => {
  return (
    <Card className="card-bordered">
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
