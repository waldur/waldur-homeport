import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useMemo, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import Flatpickr from 'react-flatpickr';

import { getBookingsList } from '@waldur/booking/api';
import { getStates } from '@waldur/booking/BookingStateFilter';
import { OFFERING_TYPE_BOOKING } from '@waldur/booking/constants';
import { getTimeOptions } from '@waldur/booking/utils';
import { parseDate } from '@waldur/core/dateUtils';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { orderByFilter } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';

import { BookingResourceListItem } from './BookingResourceListItem';

import './BookingResourcesCalendar.scss';

async function loadBookingOfferings(offeringUuid: string) {
  return await getBookingsList({
    offering_uuid: offeringUuid,
    offering_type: OFFERING_TYPE_BOOKING,
    state: [getStates()[0], getStates()[1]].map(({ value }) => value),
    o: orderByFilter({ field: 'created', mode: 'desc' }),
  });
}

interface BookingResourcesCalendarProps {
  offeringUuid: string;
}

export const BookingResourcesCalendar: FunctionComponent<BookingResourcesCalendarProps> =
  ({ offeringUuid }) => {
    const [dates, setDates] = useState(null);

    const {
      data: calendarEvents,
      isLoading,
      isRefetching,
      error,
      refetch,
    } = useQuery(['offeringBookings', offeringUuid], () =>
      loadBookingOfferings(offeringUuid),
    );

    const enabledRanges = useMemo(() => {
      if (!calendarEvents) return [];
      return calendarEvents.reduce<Array<{ from; to }>>((acc, event) => {
        return acc.concat(
          event.attributes.schedules.map((sch) => ({
            from: sch.start.toString().split('T')[0],
            to: sch.end.toString().split('T')[0],
          })),
        );
      }, []);
    }, [calendarEvents]);

    const itemsOfSelectedDate = useMemo(() => {
      if (!dates) return [];
      const date = parseDate(dates[0]);

      return calendarEvents.filter((event) => {
        return event.attributes.schedules.some((sch) => {
          const start = parseDate(sch.start);
          const end = parseDate(sch.end);
          return (
            (date > start && date < end) ||
            date.hasSame(start, 'day') ||
            date.hasSame(end, 'day')
          );
        });
      });
    }, [dates, calendarEvents]);

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
      <Card className="offering-bookings">
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
                <i className="fa fa-refresh fs-4"></i>
              </button>
            )}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Row className="mb-10">
            <Col md="auto">
              <Flatpickr
                options={{
                  dateFormat: 'Y-m-d',
                  inline: true,
                  mode: 'single',
                  enable: enabledRanges,
                  showMonths: 2,
                }}
                value={dates}
                className="form-control"
                onChange={(_dates) => setDates(_dates)}
              />
            </Col>
            {dates && dates[0] ? (
              <Col className="p-4 d-flex flex-column">
                <h2 className="fw-bold">
                  {parseDate(dates[0]).toFormat('dd LLLL yyyy')}
                </h2>
                <div className="timeline-list d-flex flex-grow-1 scroll-y mh-225px">
                  <ul className="timeline-list-times">
                    {getTimeOptions(60, true).map((time, i) => (
                      <li key={i}>
                        {time.h}:{time.m}
                      </li>
                    ))}
                  </ul>
                  <ul className="timeline-list-lines">
                    {Array.from(new Array(25)).map((_, i) => (
                      <hr key={i} />
                    ))}
                  </ul>
                  <div className="timeline-list-items flex-grow-1">
                    {itemsOfSelectedDate.map((item) => (
                      <BookingResourceListItem
                        key={item.uuid}
                        item={item}
                        date={dates[0]}
                        refetch={refetch}
                      />
                    ))}
                  </div>
                </div>
              </Col>
            ) : (
              <Col className="p-4 text-center">
                <div className="pt-10 pb-5">
                  <i className="fa fa-calendar display-5" />
                </div>
                <div className="pb-15 fw-bold">
                  <h3 className="text-gray-600 fs-5 mb-2">
                    {translate('Select a date')}
                  </h3>
                </div>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    );
  };
