import { FunctionComponent } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { ResourceSummaryButton } from '../summary/ResourceSummaryButton';

import { ActionButtonResource } from './ActionButtonResource';

export const ResourceRowActions: FunctionComponent<{ resource }> = ({
  resource,
}) => {
  const user = useSelector(getUser);
  if (!user || (user.is_support && !user.is_staff)) {
    return null;
  }
  return (
    <ButtonGroup>
      <ActionButtonResource url={resource.url} />
      <ResourceSummaryButton url={resource.url} />
    </ButtonGroup>
  );
};
