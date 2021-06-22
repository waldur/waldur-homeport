import { Customer } from '@waldur/workspace/types';

export interface InvoiceItem {
  article_code: string;
  tax: string;
  total: string;
  name: string;
  details: any;
  start: string;
  end: string;
  measured_unit: string;
  unit_price: string;
  price: string;
  factor: number;
  quantity?: number;
  project_uuid?: string;
  project_name?: string;
  resource?: string;
  resource_name?: string;
  resource_uuid?: string;
}

export interface Invoice {
  pdf?: string;
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
