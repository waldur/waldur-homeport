import { CustomerCredit } from 'waldur-js-client';

import { ServiceProvider } from '@/marketplace/types';
import { Customer } from '@/workspace/types';

export interface CustomerEditPanelProps {
  customer: Customer;
  callback(formData): Promise<any>;
  canUpdate?: boolean;
}

export interface EditCustomerProps {
  customer: Customer | ServiceProvider;
  name: string;
  callback(formData): Promise<any>;
}

export interface EditCustomerCreditProps {
  credit: CustomerCredit;
  name: string;
}
