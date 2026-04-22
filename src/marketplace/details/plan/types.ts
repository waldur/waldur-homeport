import { ComponentType, ReactNode } from 'react';
import { Customer, PublicOfferingDetails } from 'waldur-js-client';

import { OfferingComponent } from '@waldur/marketplace/types';

export interface Component extends OfferingComponent {
  price: number;
  amount: number;
  prices: number[];
  subTotal: number;
  displayAmount?: number;
  durationInMonths?: number;
  discountApplied?: boolean;
  discountAmount?: number;
  discountDescription?: string | null;
}

export interface PricesData {
  components: Component[];
  periods: string[];
  total: number;
  totalPeriods: number[];
  periodKeys: string[];
}

export interface PlanDetailsTableProps extends PricesData {
  offering: PublicOfferingDetails;
  viewMode?: boolean;
  formGroupClassName?: string;
  columnClassName?: string;
  customer?: Customer;
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
