import { connect } from 'react-redux';

import { ShoppingCartButton } from './ShoppingCartButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

const mapStateToProps = (state, ownProps) => ({
  inCart: hasItem(state, ownProps.product),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addItem(ownProps.product)),
    removeItem: () => dispatch(removeItem(ownProps.product)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ShoppingCartButtonContainer = enhance(ShoppingCartButton);
