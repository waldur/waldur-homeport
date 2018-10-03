import { OfferingAction, OfferingStateTransition } from './types';

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
