import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import { translate } from '@waldur/i18n';
import { ProposalReview } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';

interface OwnProps {
  row: ProposalReview;
}

export const ReviewsListExpandableRow: FunctionComponent<OwnProps> = ({
  row,
}) => (
  <div className="container-fluid m-t">
    <Container>
      <Field
        label={translate('Name')}
        value={renderFieldOrDash(row.proposal_name)}
      />
      <Field
        label={translate('Call')}
        value={renderFieldOrDash(row.call_name)}
      />
      <Field label={translate('Round')} value={DASH_ESCAPE_CODE} />
      <Field label="UUID" value={row.uuid} />
    </Container>
  </div>
);
