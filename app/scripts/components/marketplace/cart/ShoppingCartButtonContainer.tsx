import { connect } from 'react-redux';

import { ShoppingCartButton } from './ShoppingCartButton';
import { addCartItem, removeCartItem } from './store/actions';
import { getInShoppingCart } from './store/selectors';

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
