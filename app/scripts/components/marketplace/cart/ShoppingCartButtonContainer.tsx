import { connect } from 'react-redux';

import { OrderItemRequest } from '@waldur/marketplace/cart/types';

import { ShoppingCartButton } from './ShoppingCartButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

interface ShoppingCartButtonContainerProps {
  item: OrderItemRequest;
  flavor?: string;
  disabled?: boolean;
}

const mapStateToProps = (state, ownProps) => ({
  inCart: hasItem(state, ownProps.offering),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addItem(ownProps.item)),
    removeItem: () => dispatch(removeItem(ownProps.item)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ShoppingCartButtonContainer: React.ComponentClass<ShoppingCartButtonContainerProps> =
  enhance(ShoppingCartButton);
