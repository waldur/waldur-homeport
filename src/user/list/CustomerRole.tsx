import * as React from 'react';

import { CUSTOMER_OWNER_ROLE } from '@waldur/core/constants';
import { BooleanField } from '@waldur/table/BooleanField';

interface Props {
  row: {
    role: string;
  };
}

export const CustomerRole = ({ row }: Props) => (
  <BooleanField value={row.role === CUSTOMER_OWNER_ROLE} />
);
