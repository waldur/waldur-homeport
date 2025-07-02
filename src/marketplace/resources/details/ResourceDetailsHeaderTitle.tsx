import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

import { ResourceStateField } from '../list/ResourceStateField';

import { ParentResourceLink } from './ParentResourceLink';
import { ResourceBackendState } from './ResourceBackendState';
import { ResourceFlags } from './ResourceFlags';

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

        <ResourceStateField
          resource={resource}
          pill
          outline
          hasBullet
          size="sm"
        />

        <ResourceBackendState resource={resource} />
        <ResourceFlags resource={resource} />
      </div>
      <ParentResourceLink resource={resource} />
    </>
  );
};
