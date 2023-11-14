import { useContext, useEffect } from 'react';
import { Card } from 'react-bootstrap';

import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { translate } from '@waldur/i18n';
import { PageBarContext } from '@waldur/marketplace/context';

export const BookingMainComponent = ({ resource }) => {
  const { addTabs } = useContext(PageBarContext);
  useEffect(() => {
    addTabs([
      {
        key: 'booking',
        title: translate('Booking'),
      },
    ]);
  });
  return (
    <Card id="booking">
      <Card.Body>
        <Calendar events={resource.attributes.schedules} />
      </Card.Body>
    </Card>
  );
};
