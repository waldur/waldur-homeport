import * as React from 'react';

import { $state } from '@waldur/core/services';

interface Props {
  row: {
    customer_name: string,
    customer_uuid: string,
  };
}

const CustomerLink = ({ row }: Props) => {
  const href = $state.href('organization.dashboard', {uuid: row.customer_uuid});
  return <a href={href}>{row.customer_name}</a>;
};

export default CustomerLink;
