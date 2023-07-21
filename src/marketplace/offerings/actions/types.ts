import { Option } from '@waldur/marketplace/common/registry';
import { Category } from '@waldur/marketplace/types';

export interface OfferingAction {
  label: string;
  handler(): void;
}

export interface OfferingCreateFormData {
  name: string;
  category: Category;
  type: Option;
}
