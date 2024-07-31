import { createElement, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { isValid } from 'redux-form';

import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';
import { Offering } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';
import { Customer } from '@waldur/workspace/types';

import { formCustomerSelector, formErrorsSelector } from '../deploy/utils';
import { orderFormDataSelector } from '../utils';

import { OrderSubmitButton } from './OrderSubmitButton';
import { OrderSummaryPlanRows } from './plan/OrderSummaryPlanRows';
import { PricesData } from './plan/types';
import { pricesSelector } from './plan/utils';
import { OfferingFormData, OrderSummaryProps } from './types';

export const SummaryTable: FunctionComponent<OrderSummaryProps> = (props) => {
  return (
    <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
      {props.extraComponent ? createElement(props.extraComponent, props) : null}
      {props.formData && props.formData.plan && (
        <OrderSummaryPlanRows
          priceData={props.prices}
          customer={props.formData.customer}
        />
      )}
    </div>
  );
};

const PureOrderSummary: FunctionComponent<OrderSummaryProps> = (props) => (
  <>
    <SummaryTable {...props} />
    <OrderSubmitButton {...props} />
  </>
);

interface OrderSummaryStateProps {
  customer: Customer;
  prices: PricesData;
  formData: OfferingFormData;
  formValid: boolean;
}

const mapStateToProps = (state, ownProps) => ({
  customer: formCustomerSelector(state),
  prices: pricesSelector(state, ownProps),
  formData: orderFormDataSelector(state),
  formValid: isValid(ORDER_FORM_ID)(state),
  errors: formErrorsSelector(state),
  shouldConcealPrices: isVisible(state, MarketplaceFeatures.conceal_prices),
});

export const OrderSummary = connect<
  OrderSummaryStateProps,
  {},
  { offering: Offering }
>(mapStateToProps)(PureOrderSummary);
