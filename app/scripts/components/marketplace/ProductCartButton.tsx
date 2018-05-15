import * as React from 'react';

import { ProductButton } from './ProductButton';
import { Product } from './types';

interface ProductCartButtonProps {
  product: Product;
  inCart: boolean;
  addItem(): void;
  removeItem(): void;
}

export const ProductCartButton = (props: ProductCartButtonProps) => (
  <ProductButton
    icon="fa fa-shopping-cart"
    isActive={props.inCart}
    title={props.inCart ? 'Remove from cart' : 'Add to cart'}
    onClick={() => props.inCart ? props.removeItem() : props.addItem()}
  />
);
