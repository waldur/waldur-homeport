import { ComponentType, ReactNode } from 'react';
import {
  Customer,
  PublicOfferingDetails,
  OfferingComponent,
  Offering,
} from 'waldur-js-client';

export interface Component extends OfferingComponent {
  price: number;
  amount: number;
  prices: number[];
  subTotal: number;
  displayAmount?: number;
  durationInMonths?: number;
  /**
   * True when the component's quantity is chosen by the customer at order time
   * and no order supplies it yet (public offering pricing). `amount` is 0 by
   * fallback in that case and must not be presented as an included quantity.
   */
  quantityUnknown?: boolean;
  discountApplied?: boolean;
  discountAmount?: number;
  discountPercent?: number;
  discountDeferred?: boolean;
}

export interface PricesData {
  components: Component[];
  periods: string[];
  total: number;
  totalPeriods: number[];
  periodKeys: string[];
}

export interface PlanDetailsTableProps extends PricesData {
  offering: PublicOfferingDetails | Offering;
  viewMode?: boolean;
  formGroupClassName?: string;
  columnClassName?: string;
  customer?: Pick<Customer, 'url'>;
  concealBillingInfo?: boolean;
  endDate?: string;
  startDate?: string;
  extraTabs?: Array<{
    title: ReactNode;
    eventKey: string | number;
    component: ComponentType;
  }>;
}

export type PlanPeriod = 'monthly' | 'annual';
