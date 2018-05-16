import * as React from 'react';

import { ProductButton } from './ProductButton';
import { Product } from './types';

interface ShoppingCartButtonProps {
  product: Product;
  inCart: boolean;
  addItem(): void;
  removeItem(): void;
}

export const ShoppingCartButton = (props: ShoppingCartButtonProps) => (
  <ProductButton
    icon="fa fa-shopping-cart"
    isActive={props.inCart}
    title={props.inCart ? 'Remove from cart' : 'Add to cart'}
    onClick={() => props.inCart ? props.removeItem() : props.addItem()}
  />
);
