import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OfferingButton } from '@waldur/marketplace/common/OfferingButton';

import { OrderItemRequest } from './types';

interface ShoppingCartButtonProps {
  item: OrderItemRequest;
  addItem(): void;
  flavor?: 'primary' | 'secondary' | 'ternary';
  disabled?: boolean;
}

export const ShoppingCartButton = (props: ShoppingCartButtonProps) => (
  <OfferingButton
    icon="fa fa-shopping-cart"
    isActive={true}
    title={translate('Add to cart')}
    onClick={() => props.addItem()}
    flavor={props.flavor}
    disabled={props.disabled}
  />
);
