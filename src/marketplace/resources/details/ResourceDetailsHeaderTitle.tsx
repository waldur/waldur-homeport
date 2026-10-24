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
      <div className="flex flex-wrap gap-2 mb-2 items-center">
        <h3 className="mb-0 me-2 min-w-0 text-break">{resource.name}</h3>
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
