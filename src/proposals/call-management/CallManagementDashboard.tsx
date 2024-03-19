import { FC } from 'react';

import { CallManagementPage } from './CallManagementPage';
import { CallManagementStatistics } from './CallManagementStatistics';

export const CallManagementDashboard: FC = () => (
  <>
    <CallManagementStatistics />
    <CallManagementPage />
  </>
);
