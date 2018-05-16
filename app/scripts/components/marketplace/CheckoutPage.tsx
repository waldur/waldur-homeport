import * as React from 'react';
import { connect } from 'react-redux';

import { ShoppingCart } from '@waldur/marketplace/ShoppingCart';
import { getShoppingCartItems, getShoppingCartTotal } from '@waldur/marketplace/store/selectors';
import { Product } from '@waldur/marketplace/types';
import { connectAngularComponent } from '@waldur/store/connect';

interface CheckoutPageProps {
  items: Product[];
  total: number;
}

const PureCheckoutPage = (props: CheckoutPageProps) => (
  <>
    {props.items.length > 0 ? (
      <ShoppingCart items={props.items} total={props.total}/>
    ) : (
      <p className="text-center">Cart is empty. You should add items to cart first.</p>
    )}
  </>
);

const mapStateToProps = state => ({
  items: getShoppingCartItems(state),
  total: getShoppingCartTotal(state),
});

export const CheckoutPage = connect(mapStateToProps)(PureCheckoutPage);

export default connectAngularComponent(CheckoutPage);
