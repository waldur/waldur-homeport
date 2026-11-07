import { FC } from 'react';
import { Proposal } from 'waldur-js-client';

import { EndingField } from '@/proposals/EndingField';
import { isOpenEnded } from '@/proposals/roundCutoff';
import { DASH_ESCAPE_CODE } from '@/table/constants';

/**
 * By when a draft must be submitted: its round's cut-off. Only a draft has
 * a deadline to meet; once submitted, the cut-off says nothing about the
 * proposal, and "Has ended" on an accepted one read as its award ending.
 */
export const SubmissionDeadlineField: FC<{ row: Proposal }> = ({ row }) =>
  row.state === 'draft' ? (
    <EndingField
      endDate={row.round?.cutoff_time}
      openEnded={isOpenEnded(row.round)}
    />
  ) : (
    <>{DASH_ESCAPE_CODE}</>
  );
