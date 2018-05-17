import * as React from 'react';

import { OrderState } from './types';

interface ActionButtonsProps {
  state: OrderState;
  setState(state: OrderState): void;
}

const goForward = (props: ActionButtonsProps) => () => {
  if (props.state === 'Configure') {
    props.setState('Approve');
  }
  if (props.state === 'Approve') {
    props.setState('Review');
  }
};

const goBack = (props: ActionButtonsProps) => () => {
  if (props.state === 'Approve') {
    props.setState('Configure');
  }
  if (props.state === 'Review') {
    props.setState('Approve');
  }
};

export const ActionButtons = (props: ActionButtonsProps) => (
  <div className="display-flex justify-content-between m-t-md">
    <a className="btn btn-outline btn-default" onClick={goBack(props)}>
      <i className="fa fa-arrow-left"/>
      {' '}
      {props.state === 'Configure' && 'Back to shopping'}
      {props.state === 'Approve' && 'Back'}
      {props.state === 'Review' && 'Back'}
    </a>
    {(props.state === 'Configure' || props.state === 'Approve') && (
      <a className="btn btn-primary" onClick={goForward(props)}>
        {props.state === 'Configure' && 'Request an approval'}
        {props.state === 'Approve' && 'Purchase'}
      </a>
    )}
  </div>
);
