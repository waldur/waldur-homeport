import { useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';

import {
  formatRoundAllocationStrategy,
  formatRoundAllocationTime,
  formatRoundReviewStrategy,
  getRoundsWithStatus,
} from '../utils';

export const CallDetailsFields = ({ call }) => {
  const activeRound = useMemo(() => {
    const items = getRoundsWithStatus(call.rounds);
    const first = items[0];
    if (
      (first && first.status.label === 'Open') ||
      first.status.label === 'Scheduled'
    ) {
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
