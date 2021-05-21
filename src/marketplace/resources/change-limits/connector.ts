import { connect } from 'react-redux';
import { AsyncState } from 'react-use/lib/useAsync';
import { compose } from 'redux';
import { formValueSelector, reduxForm } from 'redux-form';

import { Limits } from '@waldur/marketplace/common/registry';
import { orderCanBeApproved as getOrderCanBeApproved } from '@waldur/marketplace/orders/store/selectors';

import { changeLimits } from '../store/constants';

import { FetchedData, getData } from './utils';

export const FORM_ID = 'marketplaceChangeLimits';

export const formSelector = formValueSelector(FORM_ID);

export interface OwnProps {
  asyncState: AsyncState<FetchedData>;
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
    return getData(
      plan,
      offering,
      newLimits,
      currentLimits,
      usages,
      orderCanBeApproved,
    );
  }
  return {
    periods: [],
    components: [],
    totalPeriods: [],
    changedTotalPeriods: [],
    orderCanBeApproved,
  };
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  submitRequest: (data) =>
    changeLimits(
      {
        resource: ownProps.asyncState.value.resource,
        limits: ownProps.asyncState.value.limitSerializer(data.limits),
      },
      dispatch,
    ),
});

export const connector = compose(
  reduxForm<{ plan: any; limits: Limits }, OwnProps>({ form: FORM_ID }),
  connect(mapStateToProps, mapDispatchToProps),
);
