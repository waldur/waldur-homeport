import { FunctionComponent } from 'react';

import { Resource } from '@waldur/marketplace/resources/types';

import { ResourceActionsButton } from './ResourceActionsButton';

interface ResourceActionsProps {
  resource: Resource;
  refetch?(): void;
}

export const ResourceActions: FunctionComponent<ResourceActionsProps> = ({
  resource,
  refetch,
}) => (
  <ResourceActionsButton
    resource={
      {
        ...resource,
        marketplace_resource_uuid: resource.uuid,
      } as any
    }
    refetch={refetch}
  />
);
