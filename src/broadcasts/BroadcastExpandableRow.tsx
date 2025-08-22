import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';
import { BroadcastMessage } from 'waldur-js-client';

import { ENV } from '@waldur/core/config';
import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import { OptionsList } from './OptionsList';
import { RecipientsField } from './RecipientsField';

export const BroadcastExpandableRow: FunctionComponent<{
  row: BroadcastMessage;
}> = ({ row }) => (
  <ExpandableContainer>
    <Row>
      <Col sm={8} style={{ whiteSpace: 'pre-line' }}>
        <p>{row.body}</p>
        <p>{ENV.plugins.WALDUR_CORE.COMMON_FOOTER_TEXT}</p>
      </Col>
      <Col sm={4}>
        <OptionsList
          label={translate('Organizations')}
          list={row.query['customers']}
        />

        <OptionsList
          label={translate('Offerings')}
          list={row.query['offerings']}
        />

        <RecipientsField row={row} />

        {row.send_at && (
          <Field
            label={translate('Send at')}
            value={formatDateTime(row.send_at)}
            labelCol={5}
            valueCol={7}
          />
        )}
      </Col>
    </Row>
  </ExpandableContainer>
);
