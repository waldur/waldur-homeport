import { Category, Offering } from '@waldur/marketplace/types';
import { Customer } from '@waldur/workspace/types';

export interface OfferingAction {
  label: string;
  handler(): void;
}

export interface OfferingImportFormData {
  api_url: string;
  token: string;
  customer: Customer;
  offering: Offering;
  category: Category;
}
