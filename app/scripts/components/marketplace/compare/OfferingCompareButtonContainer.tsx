import { connect } from 'react-redux';

import { OfferingCompareButton } from './OfferingCompareButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

const mapStateToProps = (state, ownProps) => ({
  isCompared: hasItem(state, ownProps.offering),
});

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    addItem: () => dispatch(addItem(ownProps.offering)),
    removeItem: () => dispatch(removeItem(ownProps.offering)),
  };
};

const enhance = connect(mapStateToProps, mapDispatchToProps);

export const OfferingCompareButtonContainer = enhance(OfferingCompareButton);
