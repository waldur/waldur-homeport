import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { OrderDetailsProps } from '@waldur/marketplace/types';
import { OfferingConfigurationDetails } from '@waldur/support/OfferingConfigurationDetails';

export const BookingDetails = (props: OrderDetailsProps) => {
  const schedules = props.order.attributes.schedules;
  return (
    <>
      <OfferingConfigurationDetails {...props} />
      {schedules && <Calendar events={schedules} />}
    </>
  );
};
