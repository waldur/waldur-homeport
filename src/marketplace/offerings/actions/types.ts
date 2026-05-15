import { Option } from '@/marketplace/common/registry';
import { Category } from '@/marketplace/types';

export interface OfferingCreateFormData {
  name: string;
  category: Category;
  type: Option;
  organisation?: {
    uuid: string;
    name: string;
    url: string;
  };
}
