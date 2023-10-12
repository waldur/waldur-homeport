import { createElement, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { FieldError } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { ShoppingCartUpdateButtonContainer } from '@waldur/marketplace/cart/ShoppingCartUpdateButtonContainer';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Offering } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { CheckoutPricingRow } from '../deploy/CheckoutPricingRow';
import { formErrorsSelector } from '../deploy/utils';

import { pricesSelector } from './plan/utils';
import { OfferingFormData, OrderSummaryProps } from './types';
import { formatOrderItemForCreate, formatOrderItemForUpdate } from './utils';

export const SummaryTable: FunctionComponent<OrderSummaryProps> = (props) => (
  <div className="order-summary bg-gray-100 mb-10 fs-8 fw-bold">
    <CheckoutPricingRow
      label={translate('Offering')}
      value={props.offering.name}
    />
    <CheckoutPricingRow
      label={translate('Service provider')}
      value={
        <ProviderLink customer_uuid={props.offering.customer_uuid}>
          {props.offering.customer_name}
        </ProviderLink>
      }
    />
    {props.offering.rating && (
      <CheckoutPricingRow
        label={translate('Rating')}
        value={<RatingStars rating={props.offering.rating} size="medium" />}
      />
    )}
    {props.customer && (
      <CheckoutPricingRow
        label={translate('Invoiced to')}
        value={props.customer.name}
      />
    )}
    {props.project && (
      <CheckoutPricingRow
        label={translate('Project')}
        value={props.project.name}
      />
    )}
    {props.extraComponent ? createElement(props.extraComponent, props) : null}
    {props.customer &&
      !getActiveFixedPricePaymentProfile(props.customer.payment_profiles) &&
      props.formData &&
      props.formData.plan &&
      !props.shouldConcealPrices && (
        <div className="d-flex justify-content-between fs-4">
          <p className="mb-0">
            <BillingPeriod unit={props.formData.plan.unit} />
          </p>
          <p className="mb-0">{defaultCurrency(props.total)}</p>
        </div>
      )}
  </div>
);

const PureOrderSummary: FunctionComponent<OrderSummaryProps> = (props) => (
  <>
    <figure className="d-flex justify-content-center">
      <OfferingLogo src={props.offering.thumbnail} size="sm" />
    </figure>
    <SummaryTable {...props} />
    <div className="d-flex justify-content-between mt-5">
      {!props.updateMode ? (
        <Tip
          label={
            <FieldError
              error={{ ...props.errors?.attributes, ...props.errors?.limits }}
            />
          }
          id="offering-button-errors"
          autoWidth
          className="w-100"
        >
          <ShoppingCartButtonContainer
            item={formatOrderItemForCreate(props)}
            flavor="primary"
            disabled={!props.formValid}
            className="w-100"
          />
        </Tip>
      ) : (
        <Tip
          label={
            <FieldError
              error={{ ...props.errors?.attributes, ...props.errors?.limits }}
            />
          }
          id="offering-button-errors"
          autoWidth
          className="w-100"
        >
          <ShoppingCartUpdateButtonContainer
            item={formatOrderItemForUpdate(props)}
            flavor="primary"
            disabled={!props.formValid}
            className="w-100"
          />
        </Tip>
      )}
    </div>
  </>
);

interface OrderSummaryStateProps {
  customer: Customer;
  project?: Project;
  total: number;
  formData: OfferingFormData;
  formValid: boolean;
}

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: pricesSelector(state, ownProps).total,
  formData: getFormValues(FORM_ID)(state),
  formValid: isValid(FORM_ID)(state),
  errors: formErrorsSelector(state),
  shouldConcealPrices: isVisible(state, 'marketplace.conceal_prices'),
});

export const OrderSummary = connect<
  OrderSummaryStateProps,
  {},
  { offering: Offering }
>(mapStateToProps)(PureOrderSummary);
