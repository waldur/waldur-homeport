import * as classNames from 'classnames';
import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import { useDispatch } from 'react-redux';

import { formatRelative, formatDateTime } from '@waldur/core/dateUtils';
import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { EventDetailsDialog } from '@waldur/events/EventDetailsDialog';
import { translate } from '@waldur/i18n';
import { closeModalDialog, openModalDialog } from '@waldur/modal/actions';

export const InvoiceEventItem = ({ event }) => {
  const dispatch = useDispatch();

  const showEventDetails = (event) => {
    dispatch(closeModalDialog());
    dispatch(
      openModalDialog(EventDetailsDialog, {
        resolve: {
          event: event.original,
        },
      }),
    );
  };

  return (
    <div className="vertical-timeline-block">
      <div className={classNames('vertical-timeline-icon', event.color)}>
        <i className={classNames('fa', event.icon)} />
      </div>

      <div className="vertical-timeline-content">
        <FormattedHtml html={event.message} />
        <Button
          bsSize="sm"
          bsStyle="primary"
          onClick={() => showEventDetails(event)}
        >
          <i className="fa fa-eye"></i>
          {translate('More info')}
        </Button>
        <span className="vertical-date">
          {formatRelative(event.date)} ago
          <br />
          <small>{formatDateTime(event.date)}</small>
        </span>
      </div>
    </div>
  );
};
