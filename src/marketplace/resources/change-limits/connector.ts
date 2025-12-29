import { connect } from 'react-redux';
import { AsyncState } from 'react-use/lib/useAsync';
import { compose } from 'redux';
import { formValueSelector, reduxForm } from 'redux-form';
import { Offering } from 'waldur-js-client';

import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { Limits } from '@waldur/marketplace/common/types';
import { orderCanBeApproved as getOrderCanBeApproved } from '@waldur/marketplace/orders/actions/selectors';

import { FetchedData, getLimitChangeData } from './utils';

const FORM_ID = 'marketplaceChangeLimits';

const formSelector = formValueSelector(FORM_ID);

export interface OwnProps {
  asyncState: AsyncState<FetchedData>;
  refetch?(): void;
}

export interface ComponentRowType {
  type: string;
  name: string;
  measured_unit: string;
  is_boolean: boolean;
  limit: number;
  usage: number;
  prices: number[];
  subTotal: number;
  changedSubTotal: number;
  changedLimit: number;
  changedPrices: number[];
}

export interface StateProps {
  periods: string[];
  components: ComponentRowType[];
  totalPeriods: number[];
  changedTotalPeriods: number[];
  orderCanBeApproved: boolean;
  shouldConcealPrices?: boolean;
  offering?: Offering;
  newLimits?: Limits;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const orderCanBeApproved = getOrderCanBeApproved(state);
  if (ownProps.asyncState.value) {
    const newLimits = formSelector(state, 'limits');
    const {
      offering,
      plan,
      usages,
      limits: currentLimits,
    } = ownProps.asyncState.value;
    return getLimitChangeData(
      plan,
      offering,
      newLimits,
      currentLimits,
      usages,
      orderCanBeApproved,
    );
  }
  const shouldConcealPrices = isFeatureVisible(
    MarketplaceFeatures.conceal_prices,
  );
  return {
    periods: [],
    components: [],
    totalPeriods: [],
    changedTotalPeriods: [],
    orderCanBeApproved,
    shouldConcealPrices,
  };
};

export const connector = compose(
  reduxForm<{ plan: any; limits: Limits }, OwnProps>({
    form: FORM_ID,
  }),
  connect(mapStateToProps),
);
