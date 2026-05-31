import { FC } from 'react';

import { MaintenanceList } from './MaintenanceList';

export const StaffMaintenanceList: FC = () => (
  <MaintenanceList allowAddWithoutProvider={true} />
);
