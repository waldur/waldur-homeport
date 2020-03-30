import { EventApi } from '@fullcalendar/core';
import * as moment from 'moment-timezone';
import * as React from 'react';
import { OverlayTrigger } from 'react-bootstrap';
import * as Tooltip from 'react-bootstrap/lib/Tooltip';

import { BookingProps } from '../types';

const timeFormat = event => {
  const start = moment(event.start);
  const end = moment(event.end);

  return {
    start: start.format('H:mm MMM Do'),
    end: end.format('H:mm MMM Do, Y'),
    text: `${start.format('H:mm')} - ${end.format('H:mm DD MMM, Y')}`,
    duration: moment.duration(start.diff(end)).humanize(),
    tz: moment.tz.guess(),
  };
};

export const eventContentUi = ({
  event,
}: {
  event: EventApi | BookingProps;
}) => {
  const labels = timeFormat(event);
  const titleOrType =
    event.title && event.title !== '' ? event.title : event.id;
  const timeLabel = event.allDay
    ? 'All-day booking'
    : <i className="fa fa-clock-o" /> && labels.text;

  return (
    <OverlayTrigger
      placement="bottom"
      delayShow={500}
      overlay={
        <Tooltip id={event.extendedProps.uniqueID} bsStyle=" myToolTip ">
          <div className="booking booking_detail">
            <h4>{event.id}</h4>
            <hr />
            {event.allDay && <p>An all-day event.</p>}
            <p>
              <i className="fa fa-clock-o" /> {labels.duration}
            </p>
            <div style={{ position: 'relative', padding: '8px 0' }}>
              <label
                htmlFor="stART"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: 'translateY(-50%)',
                }}
              >
                start
              </label>
              <p id="stART">{labels.start}</p>
              <p id="enD">{labels.end}</p>
              <label
                htmlFor="enD"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  transform: 'translateY(0%)',
                }}
              >
                end
              </label>
            </div>
          </div>
        </Tooltip>
      }
    >
      <div className="fc-content booking-content">
        <span className="fc-time">{timeLabel}</span>
        <span className="fc-title">{titleOrType}</span>
      </div>
    </OverlayTrigger>
  );
};
