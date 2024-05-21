import { PaymentProfile } from '@waldur/workspace/types';

type ChartData = Array<{
  label: string;
  value: number | string;
}>;

export interface Chart {
  title: string;
  units?: string;
  current: number | string;
  data: ChartData;
  changes?: number;
}

export interface Scope {
  url?: string;
  payment_profiles?: PaymentProfile[];
}

export interface InvoiceSummary {
  year: number;
  month: number;
  price: number;
}
