import * as React from 'react';

import { OfferingButton } from '@waldur/marketplace/common/OfferingButton';

import { Offering } from '../types';

interface ShoppingCartButtonProps {
  offering: Offering;
  inCart: boolean;
  addItem(): void;
  removeItem(): void;
}

export const ShoppingCartButton = (props: ShoppingCartButtonProps) => (
  <OfferingButton
    icon="fa fa-shopping-cart"
    isActive={props.inCart}
    title={props.inCart ? 'Remove from cart' : 'Add to cart'}
    onClick={() => props.inCart ? props.removeItem() : props.addItem()}
  />
);
