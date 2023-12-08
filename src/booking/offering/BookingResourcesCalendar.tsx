import { FunctionComponent, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import Flatpickr from 'react-flatpickr';

import { getTimeOptions } from '@waldur/booking/utils';
import { parseDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { BookingResource } from '../types';

import { BookingResourceListItem } from './BookingResourceListItem';

import './BookingResourcesCalendar.scss';

interface BookingResourcesCalendarProps {
  bookingResources: BookingResource[];
  refetch?(): void;
}

export const BookingResourcesCalendar: FunctionComponent<BookingResourcesCalendarProps> =
  ({ bookingResources, refetch }) => {
    const [dates, setDates] = useState(null);

    const enabledRanges = useMemo(() => {
      if (!bookingResources) return [];
      return bookingResources.reduce<Array<{ from; to }>>((acc, event) => {
        return acc.concat(
          event.attributes.schedules.map((sch) => ({
            from: sch.start.toString().split('T')[0],
            to: sch.end.toString().split('T')[0],
          })),
        );
      }, []);
    }, [bookingResources]);

    const itemsOfSelectedDate = useMemo(() => {
      if (!dates) return [];
      const date = parseDate(dates[0]);

      return bookingResources.filter((event) => {
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
    }, [dates, bookingResources]);

    return (
      <Row className="booking-resource-items-calendar mb-10">
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
    );
  };
