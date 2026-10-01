import { OrderDetailsProps } from '@/marketplace/types';
import { OfferingConfigurationDetails } from '@/support/OfferingConfigurationDetails';

import { BookingResourcesCalendar } from './offering/BookingResourcesCalendar';

export const BookingDetails = (props: OrderDetailsProps) => {
  const schedules = props.order.attributes['schedules'];

  return (
    <>
      <OfferingConfigurationDetails {...props} />
      {schedules && (
        <BookingResourcesCalendar bookingResources={[props.order as any]} />
      )}
    </>
  );
};
