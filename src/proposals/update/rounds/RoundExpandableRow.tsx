import { FunctionComponent } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Round } from '@waldur/proposals/types';
import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
  formatRoundReviewStrategy,
} from '@waldur/proposals/utils';
import { Field } from '@waldur/resource/summary';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';
import { renderFieldOrDash } from '@waldur/table/utils';

interface RoundExpandableRowProps {
  row: Round;
}

export const RoundExpandableRow: FunctionComponent<RoundExpandableRowProps> = ({
  row,
}) => (
  <ExpandableContainer asTable>
    <Field
      label={translate('Review strategy')}
      value={formatRoundReviewStrategy(row.review_strategy)}
    />
    <Field
      label={translate('Deciding entity')}
      value={formatRoundAllocationStrategy(row.deciding_entity)}
    />
    <Field
      label={translate('Allocation time')}
      value={formatRoundAllocationTime(row.allocation_time)}
    />
    {row.allocation_time === 'fixed_date' && (
      <Field
        label={translate('Allocation date')}
        value={formatDateTime(row.allocation_date)}
      />
    )}
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
  </ExpandableContainer>
);
