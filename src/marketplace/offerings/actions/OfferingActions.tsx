import * as React from 'react';
import { connect } from 'react-redux';

import { $state } from '@waldur/core/services';
import { Offering } from '@waldur/marketplace/types';

import { updateOfferingState } from '../store/actions';
import { ActionsDropdown } from './ActionsDropdown';
import './OfferingActions.scss';
import { stateTransitionActions, stateTransition, mainActions } from './utils';

interface OwnProps {
  row: Offering;
}

interface DispatchProps {
  updateOfferingState?(offering, stateAction): void;
}

const PureOfferingActions = (props: OwnProps & DispatchProps) => {
  const filterStateActions = () => {
    if (stateTransition[props.row.state]) {
      return stateTransitionActions.filter(option => stateTransition[props.row.state].indexOf(option.value) !== -1);
    }
    return [];
  };

  const assignHandler = offeringActions =>
    offeringActions.map(action => {
      switch (action.key) {
        case 'state':
          return {
            handler: e => {
              props.updateOfferingState(props.row, e.target.id);
            },
            ...action,
          };
        case 'update':
          return {
            handler: () => $state.go('marketplace-offering-update', {
              offering_uuid: props.row.uuid,
            }),
            ...action,
          };
      }
    });

  return (
    <ActionsDropdown actions={assignHandler([...filterStateActions(), ...mainActions])}/>
  );
};

const enhance = connect<{}, DispatchProps, OwnProps>(null, {
  updateOfferingState,
});

export const OfferingActions = enhance(PureOfferingActions);
