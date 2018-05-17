import * as React from 'react';
import { connect } from 'react-redux';

import { Product } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { ActionButtons } from './ActionButtons';
import { ShoppingCart } from './ShoppingCart';
import { ShoppingCartSidebar } from './ShoppingCartSidebar';
import { ShoppingCartSteps } from './ShoppingCartSteps';
import { setState } from './store/actions';
import { getItems, getState } from './store/selectors';
import { OrderState } from './types';

interface CheckoutPageProps {
  items: Product[];
  state: OrderState;
  setState(state: OrderState): void;
}

const PureCheckoutPage = (props: CheckoutPageProps) => (
  props.items.length > 0 ? (
    <div className="row">
      <div className="col-xl-9 col-lg-8">
        <ShoppingCartSteps state={props.state}/>
        <ShoppingCart items={props.items}/>
        <ActionButtons state={props.state} setState={props.setState}/>
      </div>
      <div className="col-xl-3 col-lg-4">
        <ShoppingCartSidebar/>
      </div>
    </div>
  ) : (
    <p className="text-center">
      Shopping cart is empty. You should add items to cart first.
    </p>
  )
);

const mapStateToProps = state => ({
  items: getItems(state),
  state: getState(state),
});

const mapDispatchToProps = {
  setState,
};

export const CheckoutPage = connect(mapStateToProps, mapDispatchToProps)(PureCheckoutPage);

export default connectAngularComponent(CheckoutPage);
