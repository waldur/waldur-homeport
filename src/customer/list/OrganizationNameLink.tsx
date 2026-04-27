import { FunctionComponent } from 'react';

import { Link } from '@/core/Link';

export const OrganizationNameLink: FunctionComponent<{ row }> = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.uuid }}
    label={row.name}
    data-testid={`organization-link-${row.name}`}
  />
);
