import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';
import { BackendIdTip } from '@waldur/core/Tooltip';

import { Resource } from '../types';

import { EndDateTooltip } from './EndDateTooltip';

interface PublicResourceLinkProps {
  row: Resource;
}

export const PublicResourceLink: FunctionComponent<PublicResourceLinkProps> = ({
  row,
}) => {
  const label = row.name || row.offering_name;
  return (
    <>
      <Link
        state="marketplace-resource-details"
        params={{
          resource_uuid: row.uuid,
        }}
        label={label}
      />
      <BackendIdTip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.end_date} />
    </>
  );
};
