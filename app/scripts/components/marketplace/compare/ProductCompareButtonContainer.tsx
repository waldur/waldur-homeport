import { connect } from 'react-redux';

import { ProductCompareButton } from './ProductCompareButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

const mapStateToProps = (state, ownProps) => ({
  isCompared: hasItem(state, ownProps.product),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addItem(ownProps.product)),
    removeItem: () => dispatch(removeItem(ownProps.product)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ProductCompareButtonContainer = enhance(ProductCompareButton);
