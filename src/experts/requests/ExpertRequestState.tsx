import * as classNames from 'classnames';
import * as React from 'react';
import { react2angular } from 'react2angular';

import { RequestState } from './types';

interface ExpertRequestStateProps {
  model: {
    state: RequestState;
  };
}

const LabelClasses = {
  Active: '',
  Pending: 'progress-bar-warning',
  Cancelled: 'progress-bar-danger',
  Finished: 'progress-bar-success',
};

const getLabelClass = (state: RequestState): string => LabelClasses[state] || 'label-info';

const getLabel = (state: RequestState): string => {
  if (state === 'Pending') {
    return 'Waiting for proposals'.toUpperCase();
  }
  return state.toUpperCase();
};

export const ExpertRequestState = (props: ExpertRequestStateProps) => (
  <div className="progress pull-left state-indicator m-b-none">
    <span className={classNames(getLabelClass(props.model.state), 'progress-bar', 'p-w-sm', 'full-width')}>
      {getLabel(props.model.state)}
    </span>
  </div>
);

export default react2angular(ExpertRequestState, ['model']);
