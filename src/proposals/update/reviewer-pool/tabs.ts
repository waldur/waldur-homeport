import { useMemo } from 'react';

import { translate } from '@/i18n';
import { TableTab } from '@/table/types';

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
        key: 'assignments',
        title: translate('Assignments'),
        params: { tab: 'reviewer-pool', pool_tab: 'assignments' },
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
