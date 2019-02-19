import * as React from 'react';

import { formatFilesize } from '@waldur/core/utils';

import { CategoryColumn } from '@waldur/marketplace/types';

import { ResourceDetailsLink } from '../ResourceDetailsLink';
import { Resource } from '../types';

interface CategoryColumnFieldProps {
  row: Resource;
  column: CategoryColumn;
}

export const CategoryColumnField = (props: CategoryColumnFieldProps) => {
  const metadata = props.row.backend_metadata;
  const value = props.column.attribute ? metadata[props.column.attribute] : undefined;

  switch (props.column.widget) {
    case 'csv':
      if (!Array.isArray(value) || value.length === 0) {
        return 'N/A';
      }
      return value.join(', ');

    case 'filesize':
      return formatFilesize(value);

    case 'attached_instance':
      return (
        <ResourceDetailsLink
          children={metadata.instance_name}
          item={{
            resource_uuid: metadata.instance_uuid,
            resource_type: 'OpenStackTenant.Instance',
          }}
        />
      );

    default:
      return value || 'N/A';
  }
};
