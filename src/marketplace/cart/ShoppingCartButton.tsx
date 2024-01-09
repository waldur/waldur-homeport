import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';
import { OfferingButton } from '@waldur/marketplace/common/OfferingButton';

import { OrderRequest } from './types';

interface ShoppingCartButtonProps {
  item: OrderRequest;
  onBtnClick(): void;
  flavor?: 'primary' | 'secondary' | 'ternary';
  disabled?: boolean;
  title?: string;
  icon?: string;
  isAddingItem?: boolean;
  className?: string;
}

export const ShoppingCartButton: FunctionComponent<ShoppingCartButtonProps> = (
  props,
) => (
  <OfferingButton
    icon={props.icon || 'fa fa-shopping-cart'}
    isActive={true}
    title={props.title || translate('Create')}
    onClick={() => props.onBtnClick()}
    flavor={props.flavor}
    disabled={props.disabled}
    isAddingItem={props.isAddingItem}
    className={props.className}
  />
);
