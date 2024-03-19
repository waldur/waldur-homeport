import { FC } from 'react';

import { CallManagementPage } from '@waldur/proposals/call-management/CallManagementPage';
import { CallManagementStatisticsCards } from '@waldur/proposals/call-management/CallManagementStatisticsCards';

export const CallManagementDashboard: FC = () => {
  return (
    <>
      <CallManagementStatisticsCards />
      <CallManagementPage />
    </>
  );
};
