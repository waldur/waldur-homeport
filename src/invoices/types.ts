export { Invoice, InvoiceItem } from 'waldur-js-client';
import { InvoiceItem } from 'waldur-js-client';

export interface InvoiceTableItem {
  uuid: string;
  resource_name: string;
  resource_uuid: string;
  offering_name: string;
  offering_uuid: string;
  project_name: string;
  project_uuid: string;
  service_provider_name: string;
  service_provider_uuid: string;
  plan_name: string;
  price: number;
  tax: number;
  total: number;
  items: InvoiceItem[];
}
