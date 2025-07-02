import { createElement, FC, useMemo } from 'react';
import { connect } from 'react-redux';
import { isSubmitting } from 'redux-form';
import { PublicOfferingDetails } from 'waldur-js-client';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { isFeatureVisible } from '@waldur/features/connect';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { ORDER_FORM_ID } from '@waldur/marketplace/details/constants';

import { DeployPageTotalCard } from '../deploy/DeployPageTotalCard';
import { formIsValidSelector } from '../deploy/selectors';
import { formSubmitErrorsSelector } from '../deploy/selectors';
import { formErrorsSelector } from '../deploy/selectors';
import { orderCustomerSelector } from '../deploy/selectors';
import { orderFormDataSelector } from '../deploy/selectors';

import { OrderSubmitButton } from './OrderSubmitButton';
import { OrderSummaryPlanRows } from './plan/OrderSummaryPlanRows';
import { pricesSelector, useComponentsDetailPrices } from './plan/utils';
import { OrderSummaryProps } from './types';

export const SummaryTable: FC<OrderSummaryProps> = (props) => {
  return (
    <div className={props.onlyDetails ? 'fs-6' : 'mb-8 fs-6'}>
      {props.extraComponent ? createElement(props.extraComponent, props) : null}
      {props.formData && props.formData.plan && (
        <OrderSummaryPlanRows
          priceData={props.prices}
          customer={props.formData.customer}
          hasTotal={props.onlyDetails}
        />
      )}
    </div>
  );
};

const OrderCheckout: FC<OrderSummaryProps> = (props) => {
  const { periodic, oneTime } = useComponentsDetailPrices(props.prices);

  const monthlyPriceIndex = useMemo(() => {
    const index = props.prices.periodKeys.indexOf('monthly');
    return index > -1 ? index : 0;
  }, [props.prices.periodKeys]);

  const total =
    periodic.periodicTotal[monthlyPriceIndex] + oneTime.oneTimeTotal;

  return (
    <DeployPageTotalCard
      total={defaultCurrency(total || 0)}
      offering={props.offering}
    >
      <SummaryTable {...props} />
      <OrderSubmitButton {...props} />
    </DeployPageTotalCard>
  );
};

const PureOrderSummary: FC<OrderSummaryProps> = (props) =>
  props.onlyDetails ? (
    <SummaryTable {...props} />
  ) : (
    <OrderCheckout {...props} />
  );

const mapStateToProps = (state, ownProps) => ({
  customer: orderCustomerSelector(state),
  prices: pricesSelector(state, ownProps),
  formData: orderFormDataSelector(state),
  formValid: formIsValidSelector(state),
  errors: { ...formErrorsSelector(state), ...formSubmitErrorsSelector(state) },
  isSubmitting: isSubmitting(ORDER_FORM_ID)(state),
  shouldConcealPrices: isFeatureVisible(MarketplaceFeatures.conceal_prices),
});

export const OrderSummary = connect<
  ReturnType<typeof mapStateToProps>,
  {},
  { offering: PublicOfferingDetails; onlyDetails?: boolean }
>(mapStateToProps)(PureOrderSummary);
