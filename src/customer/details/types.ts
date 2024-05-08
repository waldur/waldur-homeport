import { Customer } from '@waldur/workspace/types';

export interface CustomerEditPanelProps {
  customer: Customer;
  callback(formData, dispatch): Promise<any>;
  canUpdate?: boolean;
}

export interface AccessSubnet {
  uuid: string;
  inet: string;
  description?: string;
  customer: string;
}
