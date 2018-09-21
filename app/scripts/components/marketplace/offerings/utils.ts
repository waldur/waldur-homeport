import { connect } from 'react-redux';

import { Component } from '@waldur/marketplace/details/types';

import { getPlanPrice, getComponents, getType } from './store/selectors';
import { OfferingAction, OfferingStateTransition } from './types';

interface ConnectedPlanStateProps {
  total: number;
  components: Component[];
}

export const connectPlanComponents = connect<ConnectedPlanStateProps, {}, {plan: string}>((state, ownProps) => {
  const total = getPlanPrice(state, ownProps.plan);
  const type = getType(state);
  const components = type ? getComponents(state, type) : undefined;
  return {total, components};
});

export const stateTransition: {[value: string]: OfferingStateTransition[]} = {
  Draft: ['activate', 'archive'],
  Active: ['pause', 'archive'],
  Paused: ['activate', 'archive'],
};

export const stateTransitionActions: Array<OfferingAction<OfferingStateTransition>> = [
  {
    value: 'activate',
    label: 'Activate',
  },
  {
    value: 'pause',
    label: 'Pause',
  },
  {
    value: 'archive',
    label: 'Archive',
  },
];
