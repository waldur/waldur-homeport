import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OfferingButton } from '@waldur/marketplace/common/OfferingButton';

import { OrderItemRequest } from './types';

interface ShoppingCartButtonProps {
  item: OrderItemRequest;
  onBtnClick(): void;
  flavor?: 'primary' | 'secondary' | 'ternary';
  disabled?: boolean;
  title?: string;
  icon?: string;
  isAddingItem?: boolean;
}

export const ShoppingCartButton = (props: ShoppingCartButtonProps) => (
  <OfferingButton
    icon={props.icon || 'fa fa-shopping-cart'}
    isActive={true}
    title={props.title || translate('Add to cart')}
    onClick={() => props.onBtnClick()}
    flavor={props.flavor}
    disabled={props.disabled}
    isAddingItem={props.isAddingItem}
  />
);
