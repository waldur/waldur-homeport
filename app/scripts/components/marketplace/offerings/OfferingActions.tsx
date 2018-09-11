import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ActionsDropdown } from '@waldur/marketplace/offerings/ActionsDropdown';
import { stateTransitionActions, stateTransition } from '@waldur/marketplace/offerings/utils';

import './OfferingActions.scss';

import * as actions from './store/actions';

interface OfferingActionsProps extends TranslateProps {
  row: any;
  updateOfferingState?(offering, stateAction): void;
}

const PureOfferingActions: React.SFC<OfferingActionsProps> = (props: OfferingActionsProps) => {
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
    <ActionsDropdown translate={props.translate} actions={assignHandler(filterActions())}/>
  );
};

const matchDispatchToProps = dispatch => ({
  updateOfferingState: (offering, stateAction) => dispatch(actions.updateOfferingState(offering, stateAction)),
});

const enhance = compose(
  withTranslation,
  connect(null, matchDispatchToProps),
);

export const OfferingActions = enhance(PureOfferingActions);
