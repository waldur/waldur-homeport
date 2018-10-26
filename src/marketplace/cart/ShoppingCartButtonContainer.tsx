import { connect } from 'react-redux';

import { OrderItemRequest } from '@waldur/marketplace/cart/types';

import { ShoppingCartButton } from './ShoppingCartButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

interface OwnProps {
  item: OrderItemRequest;
  flavor?: string;
  disabled?: boolean;
}

interface StateProps {
  inCart: boolean;
}

interface DispatchProps {
  addItem(): void;
  removeItem(): void;
}

const mapStateToProps = (state, ownProps) => ({
  inCart: hasItem(state, ownProps.item),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addItem(ownProps.item)),
    removeItem: () => dispatch(removeItem(ownProps.item)),
  };
};

const enhance = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps);

export const ShoppingCartButtonContainer = enhance(ShoppingCartButton);
