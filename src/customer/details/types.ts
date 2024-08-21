import { ServiceProvider } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

export interface CustomerEditPanelProps {
  customer: Customer;
  callback(formData, dispatch): Promise<any>;
  canUpdate?: boolean;
}

export interface EditCustomerProps {
  customer: Customer | ServiceProvider;
  name: string;
  callback(formData, dispatch): Promise<any>;
}

export interface AccessSubnet {
  uuid: string;
  inet: string;
  description?: string;
  customer: string;
}
