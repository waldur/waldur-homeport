export interface Component {
  type: string;
  billing_type: 'usage' | 'fixed';
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
