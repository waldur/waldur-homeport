import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { OptionsList } from './OptionsList';
import { RecipientsField } from './RecipientsField';
import { NotificationResponseData } from './types';

export const NotificationExpandableRow: FunctionComponent<{
  row: NotificationResponseData;
}> = ({ row }) => (
  <Row>
    <Col spans={9}>
      <p>{row.body}</p>
    </Col>
    <Col spans={3}>
      <OptionsList
        label={translate('Organizations')}
        list={row.query.customers}
      />
      <OptionsList label={translate('Offerings')} list={row.query.offerings} />

      <RecipientsField row={row} />

      {row.send_at && (
        <>
          <h4 className="fw-normal">{translate('Send at')}</h4>
          <p>{formatDateTime(row.send_at)}</p>
        </>
      )}
    </Col>
  </Row>
);
