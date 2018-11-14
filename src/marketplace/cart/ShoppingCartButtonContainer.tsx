import { connect } from 'react-redux';

import { OrderItemRequest } from '@waldur/marketplace/cart/types';

import { ShoppingCartButton } from './ShoppingCartButton';
import { addItemRequest } from './store/actions';

interface OwnProps {
  item: OrderItemRequest;
  flavor?: string;
  disabled?: boolean;
}

interface DispatchProps {
  addItem(): void;
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addItemRequest(ownProps.item)),
  };
};

const enhance = connect<{}, DispatchProps, OwnProps>(null, mapDispatchToProps);

export const ShoppingCartButtonContainer = enhance(ShoppingCartButton);
