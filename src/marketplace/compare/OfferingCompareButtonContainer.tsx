import { connect } from 'react-redux';

import { Offering } from '@waldur/marketplace/types';

import { OfferingCompareButton } from './OfferingCompareButton';
import { addItem, removeItem } from './store/actions';
import { hasItem } from './store/selectors';

interface OwnProps {
  offering: Offering;
  flavor?: string;
}

interface StateProps {
  isCompared: boolean;
}

interface DispatchProps {
  addItem(): void;
  removeItem(): void;
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

const enhance = connect<StateProps, DispatchProps, OwnProps>(mapStateToProps, mapDispatchToProps);

export const OfferingCompareButtonContainer = enhance(OfferingCompareButton);
