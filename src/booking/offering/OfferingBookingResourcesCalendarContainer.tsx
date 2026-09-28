import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import {
  bookingResourcesList,
  BookingResourcesListData,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { BaseButton } from 'waldur-ui';

import { OFFERING_TYPE_BOOKING } from '@/booking/constants';
import { getBookingFilterOptionStates } from '@/booking/utils';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { BookingResource } from '../types';

import { BookingResourcesCalendar } from './BookingResourcesCalendar';

async function loadBookingOfferings(offeringUuid: string) {
  return (
    await bookingResourcesList({
      query: {
        offering_uuid: [offeringUuid],
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
            <BaseButton
              variant="text-secondary"
              onClick={() => refetch()}
              iconNode={<ArrowsClockwiseIcon weight="bold" />}
            />
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
