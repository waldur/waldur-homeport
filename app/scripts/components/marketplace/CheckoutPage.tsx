import * as React from 'react';
import { connect } from 'react-redux';

import { ShoppingCart } from '@waldur/marketplace/ShoppingCart';
import { ShoppingCartSidebar } from '@waldur/marketplace/ShoppingCartSidebar';
import { getShoppingCartItems } from '@waldur/marketplace/store/selectors';
import { Product } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

interface CheckoutPageProps {
  items: Product[];
  total: number;
}

const PureCheckoutPage = (props: CheckoutPageProps) => (
  props.items.length > 0 ? (
    <div className="row">
      <div className="col-xl-9 col-lg-8">
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
