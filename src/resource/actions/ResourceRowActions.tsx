import { FunctionComponent } from 'react';

import { useUser } from '@/workspace/hooks';

import { ResourceSummaryAction } from '../summary/ResourceSummaryButton';

import { ActionButtonResource } from './ActionButtonResource';

export const ResourceRowActions: FunctionComponent<{ resource; refetch }> = ({
  resource,
  refetch,
}) => {
  const user = useUser();
  if (!user || (user.is_support && !user.is_staff)) {
    return null;
  }
  return (
    <ActionButtonResource
      url={resource.url}
      refetch={refetch}
      extraActions={[ResourceSummaryAction]}
    />
  );
};
