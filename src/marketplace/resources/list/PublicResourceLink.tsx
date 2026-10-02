import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { BackendIdTip } from '@/core/BackendIdTip';
import { Link } from '@/core/Link';

import { EndDateTooltip } from './EndDateTooltip';

interface PublicResourceLinkProps {
  row: Resource;
  /**
   * Set when the link is shown in the provider workspace: the provider's roles
   * reach the resource only through the provider variant of the page.
   */
  providerUuid?: string;
}

export const PublicResourceLink: FunctionComponent<PublicResourceLinkProps> = ({
  row,
  providerUuid,
}) => {
  const label = row.name || row.offering_name;
  return (
    <>
      {providerUuid ? (
        <Link
          state="marketplace-provider-resource-details"
          params={{
            uuid: providerUuid,
            resource_uuid: row.uuid,
          }}
          label={label}
          className="ellipsis"
        />
      ) : (
        <Link
          state="marketplace-resource-details"
          params={{
            resource_uuid: row.uuid,
          }}
          label={label}
          className="ellipsis"
        />
      )}

      <BackendIdTip backendId={row.backend_id} />
      <EndDateTooltip end_date={row.resource_effective_end_date} />
    </>
  );
};
