import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OfferingButton } from '@waldur/marketplace/common/OfferingButton';
import { Offering } from '@waldur/marketplace/types';

interface ShoppingCartButtonProps {
  offering: Offering;
  inCart: boolean;
  addItem(): void;
  removeItem(): void;
  flavor?: 'primary' | 'secondary' | 'ternary';
  disabled?: boolean;
}

export const ShoppingCartButton = (props: ShoppingCartButtonProps) => (
  <OfferingButton
    icon="fa fa-shopping-cart"
    isActive={props.inCart}
    title={props.inCart ? translate('Remove from cart') : translate('Add to cart')}
    onClick={() => props.inCart ? props.removeItem() : props.addItem()}
    flavor={props.flavor}
    disabled={props.disabled}
  />
);
