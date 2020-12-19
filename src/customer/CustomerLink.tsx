import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

interface CustomerLinkProps {
  row: {
    customer_name: string;
    customer_uuid: string;
  };
}

export const CustomerLink: FunctionComponent<CustomerLinkProps> = ({ row }) => (
  <Link
    state="organization.dashboard"
    params={{ uuid: row.customer_uuid }}
    label={row.customer_name}
  />
);
