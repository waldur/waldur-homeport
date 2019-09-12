import { Offering, BillingType } from '@waldur/marketplace/types';

export interface Component {
  price: number;
  disable_quotas: boolean;
  type: string;
  billing_type: BillingType;
  label: string;
  units: string;
  amount: number;
  prices: number[];
  subTotal: number;
}

export interface PricesData {
  components: Component[];
  periods: string[];
  total: number;
  totalPeriods: number[];
}

export interface PlanDetailsTableProps extends PricesData {
  offering: Offering;
  viewMode?: boolean;
  formGroupClassName?: string;
  columnClassName?: string;
  limits?: string[];
}
