import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

export const OrganizationLink: FunctionComponent<{ row }> = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.uuid }}
    label={row.name}
  />
);
