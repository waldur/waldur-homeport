import { FunctionComponent } from 'react';

import { renderFieldOrDash } from '@/table/utils';

export const ResourceNameField: FunctionComponent<{ row }> = ({ row }) =>
  renderFieldOrDash(row.attributes.name || row.resource_name);
