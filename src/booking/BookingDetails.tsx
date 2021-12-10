import { Calendar } from '@waldur/booking/components/calendar/Calendar';
import { withTranslation } from '@waldur/i18n';
import { OrderItemDetailsProps } from '@waldur/marketplace/types';
import { OfferingConfigurationDetails } from '@waldur/support/OfferingConfigurationDetails';

const PureBookingDetails = (props: OrderItemDetailsProps) => {
  const schedules = props.orderItem.attributes.schedules;
  return (
    <>
      <OfferingConfigurationDetails {...props} />
      {schedules && <Calendar events={schedules} />}
    </>
  );
};

export const BookingDetails = withTranslation(PureBookingDetails);
