import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

import { ResourceFlags } from '../details/ResourceFlags';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
}

export const ResourceNameField: FunctionComponent<ResourceNameFieldProps> = ({
  row,
}) => {
  return (
    <div className="d-flex align-items-center gap-1 flex-wrap">
      <PublicResourceLink row={row} />
      <CopyToClipboardButton
        value={row.name}
        className="text-hover-primary cursor-pointer d-inline-block"
      />
      <ResourceFlags resource={row} />
    </div>
  );
};
