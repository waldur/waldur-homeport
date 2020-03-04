import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OfferingButton } from '@waldur/marketplace/common/OfferingButton';

import { OrderItemResponse } from '../orders/types';

interface ShoppingCartUpdateButtonProps {
  item: OrderItemResponse;
  updateItem(): void;
  flavor?: 'primary' | 'secondary' | 'ternary';
  disabled?: boolean;
  title?: string;
  icon?: string;
}

export const ShoppingCartUpdateButton = (
  props: ShoppingCartUpdateButtonProps,
) => (
  <OfferingButton
    icon="fa fa-refresh"
    isActive={true}
    title={translate('Update')}
    onClick={() => props.updateItem()}
    flavor={props.flavor}
    disabled={props.disabled}
  />
);
