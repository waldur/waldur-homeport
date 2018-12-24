import { OfferingAction, OfferingStateTransition } from './types';

export const stateTransition: {[value: string]: OfferingStateTransition[]} = {
  Draft: ['activate', 'archive'],
  Active: ['pause', 'archive'],
  Paused: ['activate', 'archive'],
};

export const stateTransitionActions: Array<OfferingAction<OfferingStateTransition>> = [
  {
    key: 'state',
    value: 'activate',
    label: 'Activate',
  },
  {
    key: 'state',
    value: 'pause',
    label: 'Pause',
  },
  {
    key: 'state',
    value: 'archive',
    label: 'Archive',
  },
];

export const mainActions = [
  {
    key: 'update',
    value: 'update',
    label: 'Edit',
  },
];
