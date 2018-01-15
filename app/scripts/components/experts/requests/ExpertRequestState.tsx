import * as classNames from 'classnames';
import * as React from 'react';
import { react2angular } from 'react2angular';

import { ExpertRequest } from './types';

interface ExpertRequestStateProps {
  model: ExpertRequest;
}

const LabelClasses = {
  Active: '',
  Pending: 'progress-bar-warning',
  Cancelled: 'progress-bar-danger',
  Finished: 'progress-bar-success',
};

const getLabelClass = (state: string): string =>
  classNames(LabelClasses[state] || 'label-info', 'progress-bar', 'p-w-sm', 'full-width');

export const ExpertRequestState = (props: ExpertRequestStateProps) => (
  <div className="progress pull-left state-indicator m-b-none">
    <span className={getLabelClass(props.model.state)}>
      {props.model.state.toUpperCase()}
    </span>
  </div>
);

export default react2angular(ExpertRequestState, ['model']);
