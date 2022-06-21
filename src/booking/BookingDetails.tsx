import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';
import { OfferingConfigurationDetails } from '@waldur/support/OfferingConfigurationDetails';

export const BookingDetails = (props: OrderItemDetailsProps) => {
  const schedules = props.orderItem.attributes.schedules;
  return (
    <>
      <OfferingConfigurationDetails {...props} />
      {schedules && <Calendar events={schedules} />}
    </>
  );
};
