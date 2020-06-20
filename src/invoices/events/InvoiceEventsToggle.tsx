import * as React from 'react';
import { useDispatch } from 'react-redux';

import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { InvoiceEventsDialog } from './InvoiceEventsDialog';

export const InvoiceEventsToggle = ({ item }) => {
  const dispatch = useDispatch();
  const showEvents = () => {
    dispatch(
      openModalDialog(InvoiceEventsDialog, {
        resolve: {
          item,
        },
        size: 'lg',
      }),
    );
  };
  if (!isFeatureVisible('invoice.events')) {
    return null;
  }
  return (
    <div className="hidden-print">
      <small>
        <a onClick={showEvents}>{translate('Show events')}</a>
      </small>
    </div>
  );
};
