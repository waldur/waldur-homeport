import { useContext } from 'react';
import { AccordionContext } from 'react-bootstrap';

import { OrderItemDetailsProps } from '@waldur/marketplace/types';
import { OfferingConfigurationDetails } from '@waldur/support/OfferingConfigurationDetails';

import { BookingResourcesCalendar } from './offering/BookingResourcesCalendar';

export const BookingDetails = (props: OrderItemDetailsProps) => {
  const schedules = props.orderItem.attributes.schedules;

  // We need to watch the activeEventKey of bootstrap accordion and use it as the calendar component key to re-render it.
  // Because the bootstrap accordion will crush the calendar if it is closed on the first render.
  const { activeEventKey } = useContext(AccordionContext);

  return (
    <>
      <OfferingConfigurationDetails {...props} />
      {schedules && (
        <BookingResourcesCalendar
          key={String(activeEventKey)}
          bookingResources={[props.orderItem as any]}
        />
      )}
    </>
  );
};
