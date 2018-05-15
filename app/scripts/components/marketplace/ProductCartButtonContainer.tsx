import { connect } from 'react-redux';

import { addCartItem, removeCartItem } from '@waldur/marketplace/store/actions';
import { getInCart } from '@waldur/marketplace/store/selectors';

import { ProductCartButton } from './ProductCartButton';

const mapStateToProps = (state, ownProps) => ({
  inCart: getInCart(state, ownProps.product),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addCartItem(ownProps.product)),
    removeItem: () => dispatch(removeCartItem(ownProps.product)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ProductCartButtonContainer = enhance(ProductCartButton);
