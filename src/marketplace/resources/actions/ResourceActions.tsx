import { FunctionComponent } from 'react';

import { Resource } from '@waldur/marketplace/resources/types';

import { ResourceActionsButton } from './ResourceActionsButton';

interface ResourceActionsProps {
  resource: Resource;
  reInitResource?(): void;
}

export const ResourceActions: FunctionComponent<ResourceActionsProps> = ({
  resource,
  reInitResource,
}) => (
  <ResourceActionsButton
    resource={
      {
        ...resource,
        marketplace_resource_uuid: resource.uuid,
      } as any
    }
    reInitResource={reInitResource}
  />
);
