import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { ExpandableContainer } from '@waldur/table/ExpandableContainer';

import {
  formatRoundAllocationStrategy,
  formatRoundReviewStrategy,
  getRoundsWithStatus,
} from '../utils';

export const CallExpandableRow: FunctionComponent<{
  row: Call;
}> = ({ row }) => {
  const activeRound = useMemo(() => {
    const first = getRoundsWithStatus(row.rounds)[0];
    if (
      first &&
      (first.status.label === 'Open' || first.status.label === 'Scheduled')
    ) {
      return first;
    }
    return null;
  }, [row]);

  return (
    <ExpandableContainer asTable>
      <Field
        label={translate('Next cutoff')}
        value={
          activeRound
            ? formatDateTime(activeRound.cutoff_time)
            : DASH_ESCAPE_CODE
        }
      />
      {activeRound && (
        <Field
          label={translate('Review strategy')}
          value={formatRoundReviewStrategy(activeRound.review_strategy)}
        />
      )}
      {activeRound && (
        <Field
          label={translate('Round strategy')}
          value={formatRoundAllocationStrategy(activeRound.deciding_entity)}
        />
      )}
      <Field label={translate('Submissions')} value="0" />
      <Field label={translate('Pending review')} value="0" />
      <Field
        label={translate('Resource availability')}
        value="44.54/100 % (i)"
        className="text-nowrap"
      />
    </ExpandableContainer>
  );
};
