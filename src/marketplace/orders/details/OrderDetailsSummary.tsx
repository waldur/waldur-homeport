import { connect } from 'react-redux';
import { PublicOfferingDetails } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { formIsValidSelector } from '@waldur/marketplace/deploy/selectors';
import { orderFormDataSelector } from '@waldur/marketplace/deploy/selectors';
import { SummaryTable } from '@waldur/marketplace/details/OrderSummary';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { OrderSummaryProps } from '@waldur/marketplace/details/types';
import { RootState } from '@waldur/store/reducers';
import { getCustomer, getProject } from '@waldur/workspace/selectors';

type StateProps = ReturnType<typeof mapStateToProps>;

const mapStateToProps = (state: RootState, ownProps: OrderSummaryProps) => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: pricesSelector(state, ownProps).total,
  formData: orderFormDataSelector(state),
  formValid: formIsValidSelector(state),
  shouldConcealPrices: isFeatureVisible(MarketplaceFeatures.conceal_prices),
});

export const OrderDetailsSummary = connect<
  StateProps,
  {},
  { offering: PublicOfferingDetails }
>(mapStateToProps)(SummaryTable);
