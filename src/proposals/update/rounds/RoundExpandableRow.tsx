import { FunctionComponent } from 'react';
import { Container } from 'react-bootstrap';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProposalCallRound } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

interface RoundExpandableRowProps {
  row: ProposalCallRound;
}

export const RoundExpandableRow: FunctionComponent<RoundExpandableRowProps> = ({
  row,
}) => (
  <div className="container-fluid m-t">
    <Container>
      <Field
        label={translate('Review strategy')}
        value={renderFieldOrDash(row.review_strategy)}
      />
      <Field
        label={translate('Deciding entity')}
        value={renderFieldOrDash(row.deciding_entity)}
      />
      <Field
        label={translate('Allocation time')}
        value={renderFieldOrDash(row.allocation_time)}
      />
      {row.allocation_time === 'Fixed date' && (
        <Field
          label={translate('Allocation date')}
          value={formatDateTime(row.allocation_date)}
        />
      )}
      <Field
        label={translate('Maximum allocations')}
        value={renderFieldOrDash(row.max_allocations)}
      />
      <Field
        label={translate('Minimal average scoring')}
        value={renderFieldOrDash(row.minimal_average_scoring)}
      />
      <Field
        label={translate('Review duration in days')}
        value={renderFieldOrDash(row.review_duration_in_days)}
      />
      <Field
        label={translate('Minimum number of reviewers')}
        value={renderFieldOrDash(row.minimum_number_of_reviewers)}
      />
    </Container>
  </div>
);
