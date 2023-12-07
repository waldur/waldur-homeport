import { FunctionComponent } from 'react';

export const ResourceNameField: FunctionComponent<{ row }> = ({ row }) =>
  row.attributes.name || row.resource_name || 'N/A';
