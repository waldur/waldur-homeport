import { FunctionComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import { ProposalProtectedCall } from '../types';

export const CallExpandableRow: FunctionComponent<{
  row: ProposalProtectedCall;
}> = ({ row }) => (
  <Row>
    <Col sm={12} md={6}>
      <Field
        label={translate('Next cutoff')}
        value={renderFieldOrDash(formatDateTime(row.end_time))}
      />
      <Field label={translate('Review strategy')} value={row.review_strategy} />
      <Field label={translate('Round strategy')} value={row.round_strategy} />
    </Col>
    <Col sm={12} md={6}>
      <Field label={translate('Submissions')} value="32" />
      <Field label={translate('Pending review')} value="22" />
      <Field
        label={translate('Resource availability')}
        value="44.54/100 % (i)"
        className="text-nowrap"
      />
    </Col>
  </Row>
);
