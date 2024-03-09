import { FunctionComponent, useMemo } from 'react';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ProposalCall } from '@waldur/proposals/types';
import { Field } from '@waldur/resource/summary';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { getSortedRoundsWithStatus } from '../utils';

export const CallExpandableRow: FunctionComponent<{
  row: ProposalCall;
}> = ({ row }) => {
  const activeRound = useMemo(() => {
    const items = getSortedRoundsWithStatus(row.rounds);
    const first = items[0];
    if (first && [0, 1].includes(first.state.code)) {
      return first;
    }
    return null;
  }, [row]);

  return (
    <>
      <Field
        label={translate('Next cutoff')}
        value={
          activeRound
            ? formatDateTime(activeRound.cutoff_time)
            : DASH_ESCAPE_CODE
        }
      />
      <Field
        label={translate('Review strategy')}
        value={activeRound?.review_strategy}
      />
      <Field
        label={translate('Round strategy')}
        value={activeRound?.deciding_entity}
      />
      <Field label={translate('Submissions')} value="0" />
      <Field label={translate('Pending review')} value="0" />
      <Field
        label={translate('Resource availability')}
        value="44.54/100 % (i)"
        className="text-nowrap"
      />
    </>
  );
};
