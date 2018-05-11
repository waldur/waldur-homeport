import { connect } from 'react-redux';

import { removeComparisonItem } from '@waldur/marketplace/store/actions';

import { ComparisonItemRemoveButton } from './ComparisonItemRemoveButton';

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => dispatch(removeComparisonItem(ownProps.product)),
  };
};

const enhance = connect(null, mapDispatchToProps);

export const ComparisonItemRemoveButtonContainer = enhance(ComparisonItemRemoveButton);
