import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import {
  bookingResourcesList,
  BookingResourcesListData,
} from 'waldur-js-client';

import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { getBookingFilterOptionStates } from '@waldur/booking/utils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Offering } from '@waldur/marketplace/types';

import { BookingResource } from '../types';

import { BookingResourcesCalendar } from './BookingResourcesCalendar';

async function loadBookingOfferings(offeringUuid: string) {
  return (
    await bookingResourcesList({
      query: {
        offering_uuid: offeringUuid,
        offering_type: OFFERING_TYPE_BOOKING,
        state: [
          getBookingFilterOptionStates()[0],
          getBookingFilterOptionStates()[1],
        ].map(
          ({ value }) => value,
        ) as BookingResourcesListData['query']['state'],
        o: ['-created'],
      },
    })
  ).data as any as BookingResource[];
}

interface OfferingBookingResourcesCalendarContainerProps {
  offering: Offering;
}

export const OfferingBookingResourcesCalendarContainer: FunctionComponent<
  OfferingBookingResourcesCalendarContainerProps
> = ({ offering }) => {
  const {
    data: calendarEvents,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['offeringBookings', offering.uuid],

    queryFn: () => loadBookingOfferings(offering.uuid),
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load booking offerings.')}
      />
    );
  }

  return (
    <Card className="card-bordered offering-bookings">
      <Card.Header>
        <Card.Title>
          <span className="me-2">{translate('Bookings')}</span>
          {isRefetching ? (
            <LoadingSpinner />
          ) : (
            <button
              className="btn btn-icon btn-active-light"
              onClick={() => refetch()}
            >
              <ArrowsClockwiseIcon />
            </button>
          )}
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <BookingResourcesCalendar
          bookingResources={calendarEvents}
          refetch={refetch}
        />
      </Card.Body>
    </Card>
  );
};
