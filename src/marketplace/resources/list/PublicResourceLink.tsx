import * as React from 'react';

import { Link } from '@waldur/core/Link';

import { Resource } from '../types';

interface PublicResourceLinkProps {
  row: Resource;
}

export const PublicResourceLink = ({ row }: PublicResourceLinkProps) => {
  const label = row.name || row.offering_name;
  return (
    <Link
      state="marketplace-public-resource-details"
      params={{
        uuid: row.customer_uuid,
        resource_uuid: row.uuid,
      }}
      label={label}
    />
  );
};
