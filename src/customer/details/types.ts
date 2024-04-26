import { Customer } from '@waldur/workspace/types';

export interface CustomerEditPanelProps {
  customer: Customer;
  callback(formData, dispatch): Promise<any>;
  canUpdate?: boolean;
}
