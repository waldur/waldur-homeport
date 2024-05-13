import { useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
  formatRoundReviewStrategy,
  getSortedRoundsWithStatus,
} from '../utils';

export const CallDetailsFields = ({ call }) => {
  const activeRound = useMemo(() => {
    const items = getSortedRoundsWithStatus(call.rounds);
    const first = items[0];
    if (first && [0, 1].includes(first.state.code)) {
      return first;
    }
    return null;
  }, [call]);

  return (
    <>
      <Field
        label={translate('Reference code')}
        value={call.backend_id || <>&mdash;</>}
      />
      <Field
        label={translate('Publication date')}
        value={renderFieldOrDash(formatDateTime(call.start_date))}
      />
      {activeRound && (
        <Field
          label={translate('Review strategy in active round')}
          value={formatRoundReviewStrategy(activeRound.review_strategy)}
        />
      )}
      {activeRound && (
        <Field
          label={translate('Round strategy in active round')}
          value={formatRoundAllocationStrategy(activeRound.deciding_entity)}
        />
      )}
      {activeRound && (
        <Field
          label={translate('Allocation strategy in active round')}
          value={formatRoundAllocationTime(activeRound.allocation_time)}
        />
      )}
    </>
  );
};
