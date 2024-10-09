import { Offering } from '@waldur/marketplace/types';

export interface CustomerCredit {
  uuid: string;
  url: string;
  customer: string;
  customer_name?: string;
  end_date: string;
  minimal_consumption: string; // number
  offerings: Pick<Offering, 'uuid' | 'name' | 'type' | 'url'>[];
  value: string; // number
}

export interface CustomerCreditFormData {
  value: string;
  customer: string;
  offerings: string[];
  end_date: string;
  minimal_consumption: string;
}
