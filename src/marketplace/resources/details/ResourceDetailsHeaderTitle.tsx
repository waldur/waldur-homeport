import { FunctionComponent } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

import { ResourceStateField } from '../list/ResourceStateField';
import { Resource } from '../types';

import { ParentResourceLink } from './ParentResourceLink';

interface ResourceDetailsHeaderTitleProps {
  resource: Resource;
}

export const ResourceDetailsHeaderTitle: FunctionComponent<
  ResourceDetailsHeaderTitleProps
> = ({ resource }) => {
  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
        <h3 className="mb-0 me-2">{resource.name}</h3>
        <CopyToClipboardButton
          value={resource.name}
          className="text-hover-primary cursor-pointer"
          size={20}
        />
        <ResourceStateField resource={resource} pill light hasBullet />
      </div>
      <ParentResourceLink resource={resource} />
    </>
  );
};
