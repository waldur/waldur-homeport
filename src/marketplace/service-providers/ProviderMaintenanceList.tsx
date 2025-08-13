import { FC } from 'react';

import { MaintenanceList } from '@waldur/maintenance/MaintenanceList';

export const ProviderMaintenanceList: FC<{ provider }> = ({ provider }) => {
  if (!provider) return null;
  return <MaintenanceList provider={provider} />;
};
