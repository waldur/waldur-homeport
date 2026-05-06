import { createElement, FC } from 'react';
import { connect } from 'react-redux';
import { isSubmitting } from 'redux-form';
import { PublicOfferingDetails } from 'waldur-js-client';

import { defaultCurrency } from '@/core/formatCurrency';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { ORDER_FORM_ID } from '@/marketplace/details/constants';
import { DASH_ESCAPE_CODE } from '@/table/constants';

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
          concealPrices={props.shouldConcealPrices}
        />
      )}
    </div>
  );
};

const OrderCheckout: FC<OrderSummaryProps> = (props) => {
  const { periodic, oneTime } = useComponentsDetailPrices(props.prices);

  const monthlyPriceIndex = Math.max(
    props.prices.periodKeys.indexOf('monthly'),
    0,
  );
  const total =
    (periodic.totalPeriods[monthlyPriceIndex] || 0) + oneTime.oneTimeTotal;

  return (
    <DeployPageTotalCard
      total={
        props.shouldConcealPrices
          ? DASH_ESCAPE_CODE
          : defaultCurrency(total || 0)
      }
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

const mapStateToProps = (state, ownProps) => {
  const customer = orderCustomerSelector(state);
  return {
    customer,
    prices: pricesSelector(state, ownProps),
    formData: orderFormDataSelector(state),
    formValid: formIsValidSelector(state),
    errors: {
      ...formErrorsSelector(state),
      ...formSubmitErrorsSelector(state),
    },
    isSubmitting: isSubmitting(ORDER_FORM_ID)(state),
    shouldConcealPrices:
      isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
      customer?.display_billing_info_in_projects === false,
  };
};

export const OrderSummary = connect<
  ReturnType<typeof mapStateToProps>,
  {},
  { offering: PublicOfferingDetails; onlyDetails?: boolean }
>(mapStateToProps)(PureOrderSummary);
