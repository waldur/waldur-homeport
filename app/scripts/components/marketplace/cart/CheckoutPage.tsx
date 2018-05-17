import * as React from 'react';
import { connect } from 'react-redux';

import { Product } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

import { ShoppingCart } from './ShoppingCart';
import { ShoppingCartSidebar } from './ShoppingCartSidebar';
import { ShoppingCartSteps } from './ShoppingCartSteps';
import { getShoppingCartItems } from './store/selectors';

interface CheckoutPageProps {
  items: Product[];
  total: number;
}

const PureCheckoutPage = (props: CheckoutPageProps) => (
  props.items.length > 0 ? (
    <div className="row">
      <div className="col-xl-9 col-lg-8">
        <ShoppingCartSteps stage={2}/>
        <ShoppingCart items={props.items}/>
      </div>
      <div className="col-xl-3 col-lg-4">
        <ShoppingCartSidebar/>
      </div>
    </div>
  ) : (
    <p className="text-center">
      Cart is empty. You should add items to cart first.
    </p>
  )
);

const mapStateToProps = state => ({
  items: getShoppingCartItems(state),
});

export const CheckoutPage = connect(mapStateToProps)(PureCheckoutPage);

export default connectAngularComponent(CheckoutPage);
