import { connect } from 'react-redux';

import { addComparisonItem, removeComparisonItem } from '@waldur/marketplace/store/actions';
import { getIsCompared } from '@waldur/marketplace/store/selectors';

import { ProductCompareButton } from './ProductCompareButton';

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
