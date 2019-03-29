import * as React from 'react';

import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { ResourceSummaryButton } from '@waldur/resource/summary/ResourceSummaryButton';

import { Resource } from '../types';

interface ResourceActionsButtonProps {
  row: Resource;
}

export const ResourceActionsButton = ({row}: ResourceActionsButtonProps) => (
  <>
    <ActionButtonResource
      disabled={row.scope === null}
      url={row.scope}
    />
    <ResourceSummaryButton
      disabled={row.scope === null}
      url={row.scope}
    />
  </>
);
