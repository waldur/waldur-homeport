import { FunctionComponent } from 'react';

import { CustomerAccessControlPanel } from './CustomerAccessControlPanel';
import { CustomerBillingPanel } from './CustomerBillingPanel';
import { CustomerContactPanel } from './CustomerContactPanel';
import { CustomerDetailsPanel } from './CustomerDetailsPanel';
import { CustomerMediaPanel } from './CustomerMediaPanel';
import { CustomerEditPanelProps } from './types';

export const CustomerEditPanels: FunctionComponent<CustomerEditPanelProps> = (
  props,
) => {
  return (
    <>
      <CustomerDetailsPanel {...props} />
      <CustomerContactPanel {...props} />
      <CustomerAccessControlPanel {...props} />
      <CustomerBillingPanel {...props} />
      <CustomerMediaPanel {...props} />
    </>
  );
};
