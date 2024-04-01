import { createElement, FunctionComponent, useMemo } from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { parseDate } from '@waldur/core/dateUtils';
import { Tip } from '@waldur/core/Tooltip';
import { MarketplaceFeatures } from '@waldur/FeaturesEnums';
import { FieldError } from '@waldur/form';
import { FloatingButton } from '@waldur/form/FloatingButton';
import { translate } from '@waldur/i18n';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import { Offering } from '@waldur/marketplace/types';
import { isVisible } from '@waldur/store/config';
import { getCustomer } from '@waldur/workspace/selectors';
import { Customer } from '@waldur/workspace/types';

import { formErrorsSelector } from '../deploy/utils';

import { OrderSummaryPlanRows } from './plan/OrderSummaryPlanRows';
import { PricesData } from './plan/types';
import { pricesSelector } from './plan/utils';
import { OfferingFormData, OrderSummaryProps } from './types';
import { formatOrderForCreate } from './utils';

export const SummaryTable: FunctionComponent<OrderSummaryProps> = (props) => {
  return (
    <div className="block-summary bg-gray-100 mb-10 fs-8 fw-bold">
      {props.extraComponent ? createElement(props.extraComponent, props) : null}
      {props.formData && props.formData.plan && (
        <OrderSummaryPlanRows
          priceData={props.prices}
          customer={props.customer}
        />
      )}
    </div>
  );
};

export const OrderOfferingSubmitButton = (props: OrderSummaryProps) => {
  const projectError = useMemo(() => {
    if (props.formData?.project?.end_date) {
      const endDate = parseDate(props.formData.project.end_date);
      const now = parseDate(null);
      if (endDate.hasSame(now, 'day') || endDate < now) {
        return translate('Project has reached its end date.');
      }
    }
    return null;
  }, [props.formData?.project]);

  const errorsExist =
    projectError || props.errors?.attributes || props.errors?.limits;

  return (
    <FloatingButton>
      {errorsExist && (
        <Tip
          label={
            <FieldError
              error={
                projectError || {
                  ...props.errors?.attributes,
                  ...props.errors?.limits,
                }
              }
            />
          }
          id="offering-button-errors"
          autoWidth
          className="w-100"
        >
          <ShoppingCartButtonContainer
            item={formatOrderForCreate(props)}
            flavor="primary"
            disabled={Boolean(errorsExist) || !props.formValid}
            className="w-100"
          />
        </Tip>
      )}
      {!errorsExist && (
        <ShoppingCartButtonContainer
          item={formatOrderForCreate(props)}
          flavor="primary"
          disabled={!props.formValid}
          className="w-100"
        />
      )}
    </FloatingButton>
  );
};

const PureOrderSummary: FunctionComponent<OrderSummaryProps> = (props) => (
  <>
    <SummaryTable {...props} />
    <OrderOfferingSubmitButton {...props} />
  </>
);

interface OrderSummaryStateProps {
  customer: Customer;
  prices: PricesData;
  formData: OfferingFormData;
  formValid: boolean;
}

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  prices: pricesSelector(state, ownProps),
  formData: getFormValues(FORM_ID)(state),
  formValid: isValid(FORM_ID)(state),
  errors: formErrorsSelector(state),
  shouldConcealPrices: isVisible(state, MarketplaceFeatures.conceal_prices),
});

export const OrderSummary = connect<
  OrderSummaryStateProps,
  {},
  { offering: Offering }
>(mapStateToProps)(PureOrderSummary);
