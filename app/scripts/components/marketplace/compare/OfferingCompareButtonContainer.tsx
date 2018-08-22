import { connect } from 'react-redux';

import { Offering } from '@waldur/marketplace/types';

import { OfferingCompareButton } from './OfferingCompareButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

interface OfferingCompareButtonContainerProps {
  offering: Offering;
  flavor?: string;
}

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

export const OfferingCompareButtonContainer: React.ComponentClass<OfferingCompareButtonContainerProps> =
  enhance(OfferingCompareButton);
