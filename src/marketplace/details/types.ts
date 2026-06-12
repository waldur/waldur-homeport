import { PublicOfferingDetails, Offering } from 'waldur-js-client';

import { PricesData } from './plan/types';

export interface Limits {
  [key: string]: number;
}

export interface OrderSummaryProps {
  offering: PublicOfferingDetails | Offering;
  prices?: PricesData;
  updateMode?: boolean;
  extraComponent?: React.ComponentType<any>;
  shouldConcealPrices?: boolean;
  onlyDetails?: boolean;
}
