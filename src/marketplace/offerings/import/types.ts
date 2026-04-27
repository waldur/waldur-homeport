import { Category, Offering } from '@/marketplace/types';
import { Customer } from '@/workspace/types';

export interface OfferingImportFormData {
  api_url: string;
  token: string;
  customer: Customer;
  offerings: Offering[];
  categories_set: Array<{ remote_category: string; local_category: Category }>;
}
