import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

import { ResourceStateField } from '../list/ResourceStateField';

import { ParentResourceLink } from './ParentResourceLink';
import { ResourceFlags } from './ResourceFlags';

interface ResourceDetailsHeaderTitleProps {
  resource: Resource;
}

export const ResourceDetailsHeaderTitle: FunctionComponent<
  ResourceDetailsHeaderTitleProps
> = ({ resource }) => {
  return (
    <>
      <div className="flex flex-wrap gap-1.5 mb-1.5 items-center">
        <h3 className="mb-0 me-1.5 min-w-0 wrap-anywhere">{resource.name}</h3>
        <CopyToClipboardButton
          value={resource.name}
          className="hover:text-brand cursor-pointer"
          size={20}
        />

        <ResourceStateField
          resource={resource}
          shape="pill"
          tone="outline"
          hasBullet
          size="sm"
        />

        <ResourceFlags resource={resource} />
      </div>
      <ParentResourceLink resource={resource} />
    </>
  );
};
