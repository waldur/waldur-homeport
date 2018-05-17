import { connect } from 'react-redux';

import { ProductCompareButton } from './ProductCompareButton';
import { addComparisonItem, removeComparisonItem } from './store/actions';
import { getIsCompared } from './store/selectors';

const mapStateToProps = (state, ownProps) => ({
  isCompared: getIsCompared(state, ownProps.product),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addComparisonItem(ownProps.product)),
    removeItem: () => dispatch(removeComparisonItem(ownProps.product)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const ProductCompareButtonContainer = enhance(ProductCompareButton);
