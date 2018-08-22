import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import { OrderItem } from '@waldur/marketplace/cart/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { ActionButtons } from './ActionButtons';
import { ShoppingCart } from './ShoppingCart';
import { ShoppingCartSidebar } from './ShoppingCartSidebar';
import { ShoppingCartSteps } from './ShoppingCartSteps';
import * as actions from './store/actions';
import { getState, getCheckoutItems } from './store/selectors';
import { OrderState } from './types';

interface CheckoutPageProps {
  items: OrderItem[];
  state: OrderState;
  setState(state: OrderState): void;
  createOrder(): void;
}

const PureCheckoutPage = (props: CheckoutPageProps) => (
  props.items.length > 0 ? (
    <div className="row">
      <div className="col-xl-9 col-lg-8">
        <ShoppingCartSteps state={props.state}/>
        <ShoppingCart items={props.items} editable={props.state === 'Configure'}/>
        <ActionButtons
          state={props.state}
          setState={props.setState}
          createOrder={props.createOrder}
        />
      </div>
      <div className="col-xl-3 col-lg-4">
        <ShoppingCartSidebar/>
      </div>
    </div>
  ) : (
    <p className="text-center">
      {translate('Shopping cart is empty. You should add items to cart first.')}
    </p>
  )
);

const mapStateToProps = state => ({
  items: getCheckoutItems(state),
  state: getState(state),
});

const mapDispatchToProps = {
  setState: actions.setState,
  createOrder: actions.createOrder,
};

export const CheckoutPage = connect(mapStateToProps, mapDispatchToProps)(PureCheckoutPage);

export default connectAngularComponent(CheckoutPage);
