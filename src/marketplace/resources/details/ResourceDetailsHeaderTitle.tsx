import { FunctionComponent } from 'react';

import { ResourceSelectorToggle } from '../resource-selector/ResourceSelector';
import { Resource } from '../types';

import { ParentResourceLink } from './ParentResourceLink';

interface ResourceDetailsHeaderTitleProps {
  resource: Resource;
}

export const ResourceDetailsHeaderTitle: FunctionComponent<ResourceDetailsHeaderTitleProps> =
  ({ resource }) => {
    return (
      <>
        <ResourceSelectorToggle resource={resource} />
        <ParentResourceLink resource={resource} />
      </>
    );
  };
