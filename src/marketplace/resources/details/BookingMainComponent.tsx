import { Card, CardContent, CardHeader, CardTitle } from 'waldur-ui';

import { BookingResourcesCalendar } from '@/booking/offering/BookingResourcesCalendar';
import { translate } from '@/i18n';

export const BookingMainComponent = ({ resource, refetch }) => {
  return (
    <Card bordered>
      <CardHeader>
        <CardTitle as="div">{translate('Bookings')}</CardTitle>
      </CardHeader>
      <CardContent>
        <BookingResourcesCalendar
          bookingResources={[resource]}
          refetch={refetch}
        />
      </CardContent>
    </Card>
  );
};
