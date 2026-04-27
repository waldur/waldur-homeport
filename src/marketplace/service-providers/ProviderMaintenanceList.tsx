import { FC } from 'react';

import { MaintenanceList } from '@/maintenance/MaintenanceList';

export const ProviderMaintenanceList: FC<{ provider }> = ({ provider }) => {
  if (!provider) return null;
  return <MaintenanceList provider={provider} />;
};
