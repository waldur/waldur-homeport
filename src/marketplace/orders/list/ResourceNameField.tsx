import { FunctionComponent } from 'react';

import { renderFieldOrDash } from '@waldur/table/utils';

export const ResourceNameField: FunctionComponent<{ row }> = ({ row }) =>
  renderFieldOrDash(row.attributes.name || row.resource_name);
