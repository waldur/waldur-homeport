import { FC } from 'react';
import { useSelector } from 'react-redux';
import { PublicOfferingDetails } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { SummaryTable } from '@/marketplace/details/OrderSummary';
import { useOrderPrices } from '@/marketplace/details/plan/utils';
import { getCustomer } from '@/workspace/selectors';

export const OrderDetailsSummary: FC<{
  offering: PublicOfferingDetails;
  [key: string]: any;
}> = (props) => {
  const customer = useSelector(getCustomer);
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
