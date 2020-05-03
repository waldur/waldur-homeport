import * as React from 'react';

import { Link } from '@waldur/core/Link';

export const OrganizationLink = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.uuid }}
    label={row.name}
  />
);
