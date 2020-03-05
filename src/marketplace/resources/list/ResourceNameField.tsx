import * as React from 'react';

import { Link } from '@waldur/core/Link';

import { ResourceDetailsLink } from '../ResourceDetailsLink';
import { Resource } from '../types';

interface ResourceNameFieldProps {
  row: Resource;
}

export const ResourceNameField = ({ row }: ResourceNameFieldProps) => {
  const label = row.name || row.offering_name;
  if (row.resource_type && row.resource_uuid) {
    return <ResourceDetailsLink item={row}>{label}</ResourceDetailsLink>;
  } else {
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
  }
};
