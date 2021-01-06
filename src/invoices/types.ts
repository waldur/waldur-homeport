import { Customer } from '@waldur/customer/types';

export interface InvoiceItem {
  tax: string;
  total: string;
  name: string;
  details: any;
  scope_uuid: string;
  scope_type: string;
  start: string;
  end: string;
  measured_unit: string;
  unit_price: string;
  price: string;
  factor: number;
  quantity?: number;
  project_uuid?: string;
  project_name?: string;
}

export interface Invoice {
  number: string;
  customer_details: Customer;
  issuer_details: Customer;
  due_date: string;
  invoice_date: string;
  period: string;
  price: string;
  tax: any;
  total: any;
  items: InvoiceItem[];
  year: number;
  month: number;
  url: string;
}
