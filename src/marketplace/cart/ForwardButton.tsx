import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';

import { OrderItemResponse } from '../orders/types';
import { createOrder } from './store/actions';
import { getItems } from './store/selectors';

interface ForwardButtonProps {
  createOrder(): void;
  items: OrderItemResponse[];
}

const PureForwardButton = (props: ForwardButtonProps) =>
  props.items.length > 0 ? (
    <ActionButton
      title={translate('Request an approval')}
      icon="fa fa-arrow-right"
      className="btn btn-primary"
      action={props.createOrder}
    />
  ) : null;

export const ForwardButton = connect(state => ({ items: getItems(state)}), {createOrder})(PureForwardButton);
