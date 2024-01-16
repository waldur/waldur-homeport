import { createElement, FunctionComponent, useRef } from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { Tip } from '@waldur/core/Tooltip';
import useOnScreen from '@waldur/core/useOnScreen';
import { FieldError } from '@waldur/form';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { ShoppingCartUpdateButtonContainer } from '@waldur/marketplace/cart/ShoppingCartUpdateButtonContainer';
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
import { formatOrderForCreate, formatOrderForUpdate } from './utils';

export const SummaryTable: FunctionComponent<OrderSummaryProps> = (props) => {
  return (
    <div className="order-summary bg-gray-100 mb-10 fs-8 fw-bold">
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
  const mainButtonRef = useRef(null);
  const isOnScreen = useOnScreen(mainButtonRef);

  const errorsExist = props.errors?.attributes || props.errors?.limits;

  const buttonsJsx = !props.updateMode ? (
    <>
      {errorsExist && (
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
            item={formatOrderForCreate(props)}
            flavor="primary"
            disabled={!props.formValid}
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
    </>
  ) : (
    <>
      {errorsExist && (
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
            item={formatOrderForUpdate(props)}
            flavor="primary"
            disabled={!props.formValid}
            className="w-100"
          />
        </Tip>
      )}
      {!errorsExist && (
        <ShoppingCartUpdateButtonContainer
          item={formatOrderForUpdate(props)}
          flavor="primary"
          disabled={!props.formValid}
          className="w-100"
        />
      )}
    </>
  );

  return (
    <>
      <div ref={mainButtonRef} className="d-flex justify-content-between mt-5">
        {buttonsJsx}
      </div>
      <div
        className={
          'floating-submit-button d-xl-none' +
          (!isOnScreen ? ' active' : undefined)
        }
      >
        {buttonsJsx}
      </div>
    </>
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
  shouldConcealPrices: isVisible(state, 'marketplace.conceal_prices'),
});

export const OrderSummary = connect<
  OrderSummaryStateProps,
  {},
  { offering: Offering }
>(mapStateToProps)(PureOrderSummary);
