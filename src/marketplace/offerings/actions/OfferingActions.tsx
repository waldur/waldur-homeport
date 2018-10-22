import * as React from 'react';
import { connect } from 'react-redux';

import { Offering } from '@waldur/marketplace/types';

import * as actions from '../store/actions';
import { ActionsDropdown } from './ActionsDropdown';
import './OfferingActions.scss';
import { stateTransitionActions, stateTransition } from './utils';

interface OwnProps {
  row: Offering;
}

interface DispatchProps {
  updateOfferingState?(offering, stateAction): void;
}

const PureOfferingActions = (props: OwnProps & DispatchProps) => {
  const onStateChange = e => {
    props.updateOfferingState(props.row, e.target.id);
  };

  const filterActions = () => {
    if (stateTransition[props.row.state]) {
      return stateTransitionActions.filter(option => stateTransition[props.row.state].indexOf(option.value) !== -1);
    }
    return [];
  };

  const assignHandler = offeringActions =>
    offeringActions.map(action => ({
      handler: onStateChange,
      ...action,
    }));

  return (
    <ActionsDropdown actions={assignHandler(filterActions())}/>
  );
};

const matchDispatchToProps = dispatch => ({
  updateOfferingState: (offering, stateAction) => dispatch(actions.updateOfferingState(offering, stateAction)),
});

const enhance = connect<{}, DispatchProps, OwnProps>(null, matchDispatchToProps);

export const OfferingActions = enhance(PureOfferingActions);
