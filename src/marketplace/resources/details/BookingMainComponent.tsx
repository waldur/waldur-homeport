import { Card } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';

export const BookingMainComponent = ({ resource }) => (
  <Card>
    <Card.Body>
      <Calendar events={resource.attributes.schedules} />
    </Card.Body>
  </Card>
);
