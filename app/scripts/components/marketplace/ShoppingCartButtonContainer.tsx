import { connect } from 'react-redux';

import { addCartItem, removeCartItem } from '@waldur/marketplace/store/actions';
import { getInShoppingCart } from '@waldur/marketplace/store/selectors';

import { ShoppingCartButton } from './ShoppingCartButton';

const mapStateToProps = (state, ownProps) => ({
  inCart: getInShoppingCart(state, ownProps.product),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addCartItem(ownProps.product)),
    removeItem: () => dispatch(removeCartItem(ownProps.product)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ShoppingCartButtonContainer = enhance(ShoppingCartButton);
