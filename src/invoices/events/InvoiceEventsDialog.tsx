import * as React from 'react';
import Button from 'react-bootstrap/lib/Button';
import ModalBody from 'react-bootstrap/lib/ModalBody';
import ModalFooter from 'react-bootstrap/lib/ModalFooter';
import ModalHeader from 'react-bootstrap/lib/ModalHeader';
import ModalTitle from 'react-bootstrap/lib/ModalTitle';
import useAsyncRetry from 'react-use/lib/useAsyncRetry';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';

import { InvoiceEventItem } from './InvoiceEventItem';
import { loadEvents } from './utils';

export const InvoiceEventsDialog = ({ resolve }) => {
  const { loading, error, value: events, retry } = useAsyncRetry(() =>
    loadEvents(resolve.item),
  );

  return (
    <>
      <ModalHeader>
        <ModalTitle>{translate('Invoice events timeline')}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>
            <p>{translate('Unable to load events for this resource.')}</p>
            <Button bsStyle="primary" onClick={retry}>
              <i className="fa fa-refresh"></i>
              {translate('Retry')}
            </Button>
          </>
        ) : events.length === 0 ? (
          translate('There are no events for this resource.')
        ) : (
          <div
            id="vertical-timeline"
            className="vertical-container dark-timeline"
          >
            {events.map((event, index) => (
              <InvoiceEventItem event={event} key={index} />
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <CloseDialogButton />
      </ModalFooter>
    </>
  );
};
