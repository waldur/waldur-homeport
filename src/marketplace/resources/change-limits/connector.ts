import { connect } from 'react-redux';
import { compose } from 'redux';
import { formValueSelector, reduxForm } from 'redux-form';

import { QueryChildProps } from '@waldur/core/Query';
import {
  Limits,
  filterOfferingComponents,
} from '@waldur/marketplace/common/registry';
import { getBillingPeriods } from '@waldur/marketplace/common/utils';
import { orderCanBeApproved as getOrderCanBeApproved } from '@waldur/marketplace/orders/store/selectors';

import { changeLimits } from '../store/constants';

import { FetchedData } from './utils';

const FORM_ID = 'marketplaceChangeLimits';

export const formSelector = formValueSelector(FORM_ID);

export type OwnProps = QueryChildProps<FetchedData>;

export interface ComponentRowType {
  type: string;
  name: string;
  measured_unit: string;
  limit: number;
  usage: number;
  prices: number[];
}

export interface StateProps {
  periods: string[];
  components: ComponentRowType[];
  totalPeriods: number[];
  orderCanBeApproved: boolean;
}

const mapStateToProps = (state, ownProps: OwnProps): StateProps => {
  const orderCanBeApproved = getOrderCanBeApproved(state);
  if (ownProps.data) {
    const newLimits = formSelector(state, 'limits');
    const { offering, plan, usages, limits: currentLimits } = ownProps.data;
    const { periods, multipliers } = getBillingPeriods(plan.unit);
    const offeringComponents = filterOfferingComponents(offering);
    const components = offeringComponents.map(component => {
      const price = plan.prices[component.type] || 0;
      const subTotal = price * newLimits[component.type] || 0;
      const prices = multipliers.map(mult => mult * subTotal);
      return {
        type: component.type,
        name: component.name,
        measured_unit: component.measured_unit,
        usage: usages[component.type] || 0,
        limit: currentLimits[component.type],
        prices,
        subTotal,
      };
    });
    const total = components.reduce(
      (result, item) => result + item.subTotal,
      0,
    );
    const totalPeriods = multipliers.map(mult => mult * total || 0);
    return {
      periods,
      components,
      orderCanBeApproved,
      totalPeriods,
    };
  }
  return {
    periods: [],
    components: [],
    totalPeriods: [],
    orderCanBeApproved,
  };
};

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  submitRequest: data =>
    changeLimits(
      {
        marketplace_resource_uuid: ownProps.data.resource.uuid,
        resource_uuid: ownProps.data.resource.resource_uuid,
        resource_type: ownProps.data.resource.resource_type,
        limits: ownProps.data.limitSerializer(data.limits),
      },
      dispatch,
    ),
});

export const connector = compose(
  reduxForm<{ plan: any; limits: Limits }, OwnProps>({ form: FORM_ID }),
  connect(mapStateToProps, mapDispatchToProps),
);
