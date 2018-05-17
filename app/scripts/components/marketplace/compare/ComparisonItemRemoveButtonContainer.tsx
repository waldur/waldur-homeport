import { connect } from 'react-redux';

import { ComparisonItemRemoveButton } from './ComparisonItemRemoveButton';
import { removeItem } from './store/actions';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => dispatch(removeItem(ownProps.product)),
  };
};

const enhance = connect(null, mapDispatchToProps);

export const ComparisonItemRemoveButtonContainer = enhance(ComparisonItemRemoveButton);
