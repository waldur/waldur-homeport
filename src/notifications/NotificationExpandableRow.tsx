import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';

import { IdNamePair, NotificationResponseData } from './types';

const OptionsList = ({ label, list }: { label: string; list: IdNamePair[] }) =>
  list ? (
    <>
      <h4 className="fw-normal">{label}</h4>
      <p>{list.map((c) => c.name || c).join(', ')}</p>
    </>
  ) : null;

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
      <h4 className="fw-normal">{translate('Recipients')}</h4>
      <p>{row.emails.join(', ')}</p>
      {row.send_at && (
        <>
          <h4 className="fw-normal">{translate('Send at')}</h4>
          <p>{formatDateTime(row.send_at)}</p>
        </>
      )}
    </Col>
  </Row>
);
