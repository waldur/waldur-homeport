import * as React from 'react';
import { connect } from 'react-redux';

import { translate } from '@waldur/i18n';
import ActionButton from '@waldur/table-react/ActionButton';

import { OrderItemResponse } from '../orders/types';
import { createOrderRequest } from './store/actions';
import { getItems, isCreatingOrder } from './store/selectors';
import { OuterState } from './types';

interface ForwardButtonProps {
  createOrder(): void;
  items: OrderItemResponse[];
  disabled: boolean;
}

const PureForwardButton = (props: ForwardButtonProps) =>
  props.items.length > 0 ? (
    <ActionButton
      title={translate('Request an approval')}
      icon="fa fa-arrow-right"
      className="btn btn-primary"
      action={props.createOrder}
      disabled={props.disabled}
    />
  ) : null;

const mapStateToProps = (state: OuterState) => ({
  items: getItems(state),
  disabled: isCreatingOrder(state),
});

const connector = connect(mapStateToProps, {createOrder: createOrderRequest});

export const ForwardButton = connector(PureForwardButton) as React.ComponentClass<{}>;
