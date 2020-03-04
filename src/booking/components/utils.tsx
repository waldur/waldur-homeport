import { EventApi } from '@fullcalendar/core';
import * as classNames from 'classnames';
import * as React from 'react';
import * as OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import * as BootstrapTooltip from 'react-bootstrap/lib/Tooltip';
import * as ReactDOM from 'react-dom';

import { formatShortDateTime, formatTime } from '@waldur/core/dateUtils';

export const bookingDataTemplate = event => {
  const getLabels = Object.keys(event);
  const getLabelValues = getLabels.map(label => ({
    label,
    value: event[label],
  }));
  return getLabelValues.map(item => (
    <>
      <div className="form-group">
        <label className="control-label col-xs-4">{item.label}</label>
        <span>{item.value === ('' || undefined) ? 'N/A' : item.value}</span>
      </div>
    </>
  ));
};

const renderEventWithTooltip = ({
  event,
  el,
}: {
  event: EventApi;
  el: HTMLElement;
}) => {
  ReactDOM.render(
    <OverlayTrigger
      placement="top"
      overlay={
        <BootstrapTooltip id={event.id}>
          <div className="container-fluid form-horizontal">
            <h4 className="fc-title">{event.title}</h4>
            {bookingDataTemplate({
              'All day': event.allDay ? 'Yes' : 'No',
              Start: formatShortDateTime(event.start),
              End: formatShortDateTime(event.end),
              State: event.extendedProps.state,
            })}
          </div>
        </BootstrapTooltip>
      }
    >
      <div className={el.children[0].className}>
        {event.title ? (
          <span className="fc-title">{event.title}</span>
        ) : (
          <span className="fc-time">
            {formatTime(event.end)} - {formatTime(event.start)}
          </span>
        )}
      </div>
    </OverlayTrigger>,
    el,
  );
};

export const eventRender = (info: {
  event: EventApi;
  el: HTMLElement;
  withTooltip?: boolean;
}) => {
  const { event, el, withTooltip } = info;
  if (el.classList.contains('progress')) {
    el.children[0].className = classNames(
      el.children[0].className,
      'progress-bar',
      'full-width ',
      {
        'progress-bar-striped active': event.extendedProps.state === 'Creating',
      },
    );
  }
  if (withTooltip) {
    renderEventWithTooltip(info);
  }
};
