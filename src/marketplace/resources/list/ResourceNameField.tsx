import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { PublicMaintenanceBadge } from '@/maintenance/public/PublicMaintenanceBadge';

import { ResourceFlags } from '../details/ResourceFlags';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
  providerUuid?: string;
}

export const ResourceNameField: FunctionComponent<ResourceNameFieldProps> = ({
  row,
  providerUuid,
}) => {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <PublicResourceLink row={row} providerUuid={providerUuid} />
      <CopyToClipboardButton
        value={row.name}
        className="hover:text-brand cursor-pointer inline-block"
      />
      <ResourceFlags resource={row} />
      <PublicMaintenanceBadge offeringUuid={row.offering_uuid} />
    </div>
  );
};
