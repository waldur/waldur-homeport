import { Customer } from '@waldur/customer/types';

export interface InvoiceItem {
  name: string;
  details: any;
  start: string;
  end: string;
  unit_price: string;
  price: string;
  factor: number;
  quantity?: number;
}

export interface Invoice {
  number: string;
  customer_details: Customer;
  period: string;
  price: string;
  items: InvoiceItem[];
}
