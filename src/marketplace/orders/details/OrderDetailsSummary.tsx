import { FC } from 'react';
import { PublicOfferingDetails } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { SummaryTable } from '@/marketplace/details/OrderSummary';
import { useOrderPrices } from '@/marketplace/details/plan/utils';
import { useCustomer } from '@/workspace/hooks';

export const OrderDetailsSummary: FC<{
  offering: PublicOfferingDetails;
  [key: string]: any;
}> = (props) => {
  const customer = useCustomer();
  const prices = useOrderPrices(props);

  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    customer?.display_billing_info_in_projects === false;

  return (
    <SummaryTable
      prices={prices}
      shouldConcealPrices={shouldConcealPrices}
      {...props}
    />
  );
};
