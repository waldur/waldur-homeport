import * as React from 'react';
import * as ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import { useSelector } from 'react-redux';

import { getUser } from '@waldur/workspace/selectors';

import { ResourceSummaryButton } from '../summary/ResourceSummaryButton';

import { ActionButtonResource } from './ActionButtonResource';

export const ResourceRowActions = ({ resource }) => {
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
