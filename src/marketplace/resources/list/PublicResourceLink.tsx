import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { BackendIdTip } from '@/core/Tooltip';

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
        className="ellipsis"
      />

      <BackendIdTip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.end_date} />
    </>
  );
};
