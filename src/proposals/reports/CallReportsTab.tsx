import { FC, useMemo } from 'react';

import { Call } from '@/proposals/types';

import { ReportsPage } from './ReportsPage';

/** The Reports tab of a call's Manage page: that call alone. */
export const CallReportsTab: FC<{ call: Call }> = ({ call }) => {
  const scope = useMemo(() => ({ callUuid: call.uuid }), [call.uuid]);
  return <ReportsPage scope={scope} />;
};
