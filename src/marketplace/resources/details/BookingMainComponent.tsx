import { BookingResourcesCalendar } from '@/booking/offering/BookingResourcesCalendar';
import { translate } from '@/i18n';

export const BookingMainComponent = ({ resource, refetch }) => {
  return (
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title">{translate('Bookings')}</div>
      </div>
      <div className="card-body">
        <BookingResourcesCalendar
          bookingResources={[resource]}
          refetch={refetch}
        />
      </div>
    </div>
  );
};
