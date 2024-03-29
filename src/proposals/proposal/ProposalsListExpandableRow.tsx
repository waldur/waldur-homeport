import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import { formatShortDate } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Proposal } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';

interface OwnProps {
  row: Proposal;
}

export const ProposalsListExpandableRow: FunctionComponent<OwnProps> = ({
  row,
}) => (
  <div className="container-fluid m-t">
    <Container>
      <Field label={translate('Name')} value={renderFieldOrDash(row.name)} />
      <Field label={translate('Call')} value={DASH_ESCAPE_CODE} />
      <Field
        label={translate('Round')}
        value={
          <>
            {formatShortDate(row.round.start_time)}
            {' - '}
            {formatShortDate(row.round.cutoff_time)}
          </>
        }
      />
      <Field label="UUID" value={row.uuid} />
    </Container>
  </div>
);
