import { Offering, OfferingComponent } from '@waldur/marketplace/types';

export interface Component extends OfferingComponent {
  price: number;
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
