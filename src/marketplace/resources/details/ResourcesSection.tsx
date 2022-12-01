import { FC } from 'react';
import { QueryFunction } from 'react-query';

import { ResourcesList } from './ResourcesList';
import { DataPage } from './types';

interface ResourcesSectionProps {
  loadData: QueryFunction<DataPage>;
  queryKey: string;
  canAdd?: boolean;
}

export const ResourcesSection: FC<ResourcesSectionProps> = ({
  loadData,
  queryKey,
}) => {
  return <ResourcesList loadData={loadData} queryKey={queryKey} />;
};
