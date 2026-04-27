import { connect } from 'react-redux';
import { PublicOfferingDetails } from 'waldur-js-client';

import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { formIsValidSelector } from '@/marketplace/deploy/selectors';
import { orderFormDataSelector } from '@/marketplace/deploy/selectors';
import { SummaryTable } from '@/marketplace/details/OrderSummary';
import { pricesSelector } from '@/marketplace/details/plan/utils';
import { OrderSummaryProps } from '@/marketplace/details/types';
import { RootState } from '@/store/reducers';
import { getCustomer, getProject } from '@/workspace/selectors';

type StateProps = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: RootState, ownProps: OrderSummaryProps) => {
  const customer = getCustomer(state);
  return {
    customer,
    project: getProject(state),
    total: pricesSelector(state, ownProps).total,
    formData: orderFormDataSelector(state),
    formValid: formIsValidSelector(state),
    shouldConcealPrices:
      isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
      customer?.display_billing_info_in_projects === false,
  };
};

export const OrderDetailsSummary = connect<
  StateProps,
  {},
  { offering: PublicOfferingDetails }
>(mapStateToProps)(SummaryTable);
