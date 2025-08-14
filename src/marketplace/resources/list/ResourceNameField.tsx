import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
}

export const ResourceNameField: FunctionComponent<ResourceNameFieldProps> = ({
  row,
}) => {
  return (
    <div className="d-flex align-items-center gap-1">
      <PublicResourceLink row={row} />
      <CopyToClipboardButton
        value={row.name}
        className="ms-2 text-hover-primary cursor-pointer d-inline-block"
      />
    </div>
  );
};
