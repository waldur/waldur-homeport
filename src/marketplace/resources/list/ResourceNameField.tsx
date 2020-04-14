import * as React from 'react';

import { ResourceDetailsLink } from '../ResourceDetailsLink';
import { Resource } from '../types';

import { PublicResourceLink } from './PublicResourceLink';

interface ResourceNameFieldProps {
  row: Resource;
}

export const ResourceNameField = ({ row }: ResourceNameFieldProps) => {
  const label = row.name || row.offering_name;
  if (row.resource_type && row.resource_uuid) {
    return <ResourceDetailsLink item={row}>{label}</ResourceDetailsLink>;
  } else {
    return <PublicResourceLink row={row} />;
  }
};
