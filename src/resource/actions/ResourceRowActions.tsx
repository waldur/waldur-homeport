import { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { ResourceSummaryButton } from '../summary/ResourceSummaryButton';

import { ActionButtonResource } from './ActionButtonResource';

export const ResourceRowActions: FunctionComponent<{ resource; refetch }> = ({
  resource,
  refetch,
}) => {
  const user = useSelector(getUser);
  if (!user || (user.is_support && !user.is_staff)) {
    return null;
  }
  return (
    <>
      <ActionButtonResource url={resource.url} refetch={refetch} />
      <ResourceSummaryButton url={resource.url} />
    </>
  );
};
