import { ArrowsClockwiseIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
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
    <div className="card card-bordered">
      <div className="card-header">
        <div className="card-title">
          <span className="me-1.5">{translate('Bookings')}</span>
          {isRefetching ? (
            <LoadingSpinner />
          ) : (
            <BaseButton
              tooltip={translate('Refresh')}
              variant="text-secondary"
              onClick={() => refetch()}
              iconNode={<ArrowsClockwiseIcon weight="bold" />}
            />
          )}
        </div>
      </div>
      <div className="card-body">
        <BookingResourcesCalendar
          bookingResources={calendarEvents}
          refetch={refetch}
        />
      </div>
    </div>
  );
};
