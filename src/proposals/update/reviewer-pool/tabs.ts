import { useMemo } from 'react';

import { translate } from '@/i18n';
import { TableTab } from '@/table/types';

/** Where a call's draft assignment batches are sent from. */
export const ASSIGNMENT_BATCHES_STATE = 'protected-call.manage';

export const assignmentBatchesParams = (callUuid: string) => ({
  call_uuid: callUuid,
  tab: 'reviewer-pool',
  pool_tab: 'assignment_batches',
});

export const useReviewerPoolTabs = (): TableTab[] => {
  return useMemo(
    () => [
      {
        key: 'pool',
        title: translate('Pool'),
        params: { tab: 'reviewer-pool', pool_tab: 'pool' },
        default: true,
      },
      {
        key: 'discovery',
        title: translate('Discovery'),
        params: { tab: 'reviewer-pool', pool_tab: 'discovery' },
      },
      {
        key: 'assignment_batches',
        title: translate('Assignment batches'),
        params: { tab: 'reviewer-pool', pool_tab: 'assignment_batches' },
      },
      {
        key: 'reviewer_capacity',
        title: translate('Reviewer capacity'),
        params: { tab: 'reviewer-pool', pool_tab: 'reviewer_capacity' },
      },
      {
        key: 'coi',
        title: translate('COI'),
        params: { tab: 'reviewer-pool', pool_tab: 'coi' },
      },
    ],
    [],
  );
};
