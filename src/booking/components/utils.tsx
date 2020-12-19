import type { EventApi } from '@fullcalendar/core';
import classNames from 'classnames';
import { OverlayTrigger, Tooltip as BootstrapTooltip } from 'react-bootstrap';
import ReactDOM from 'react-dom';

import { bookingStateAliases } from '@waldur/booking/BookingStateField';
import { formatShortDateTime, formatTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

export const bookingDataTemplate = (event) => {
  const getLabels = Object.keys(event);
  const getLabelValues = getLabels.map((label) => ({
    label,
    value: event[label],
  }));
  return getLabelValues.map((item, index) => (
    <div key={index} style={{ width: '280px' }}>
      <div className="form-group">
        <label className="control-label col-xs-4" style={{ marginTop: '-7px' }}>
          {item.label}
        </label>
        <>{item.value ? item.value : 'N/A'}</>
      </div>
    </div>
  ));
};

const getTooltipInformation = (event) => ({
  [translate('Start')]: formatShortDateTime(event.start),
  [translate('End')]: formatShortDateTime(event.end),
  [translate('Name')]: event.extendedProps.name,
  [translate('Offering')]: event.extendedProps.offering_name,
  [translate('Project')]: event.extendedProps.project_name,
  [translate('Organization')]: event.extendedProps.customer_name,
  [translate('Created by')]: event.extendedProps.created_by_full_name,
  [translate('Approved by')]: event.extendedProps.approved_by_full_name,
  [translate('Created')]: event.extendedProps.created,
  [translate('State')]: bookingStateAliases(event.extendedProps.state),
});

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
            {bookingDataTemplate(getTooltipInformation(event))}
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
