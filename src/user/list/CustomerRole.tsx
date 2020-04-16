import * as React from 'react';

import { BooleanField } from '@waldur/table-react/BooleanField';

interface Props {
  row: {
    role: string;
  };
}

const CustomerRole = ({ row }: Props) => (
  <BooleanField value={row.role === 'owner'} />
);

export default CustomerRole;
