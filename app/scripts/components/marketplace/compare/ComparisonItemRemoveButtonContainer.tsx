import { connect } from 'react-redux';

import { ComparisonItemRemoveButton } from './ComparisonItemRemoveButton';
import { removeComparisonItem } from './store/actions';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => dispatch(removeComparisonItem(ownProps.product)),
  };
};

const enhance = connect(null, mapDispatchToProps);

export const ComparisonItemRemoveButtonContainer = enhance(ComparisonItemRemoveButton);
