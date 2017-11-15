import * as React from 'react';
import BooleanField from '@waldur/table-react/BooleanField';

type Props = {
  row: {
    is_expert_provider: boolean
  }
};

const CustomerExpertField = ({ row }: Props) => (
  <BooleanField value={row.is_expert_provider}/>
);

export default CustomerExpertField;
