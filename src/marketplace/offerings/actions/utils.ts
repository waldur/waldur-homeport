import { translate } from '@waldur/i18n';

import { OfferingAction, OfferingStateTransition } from './types';

export const stateTransition: {[value: string]: OfferingStateTransition[]} = {
  Draft: ['activate', 'archive'],
  Active: ['pause', 'archive'],
  Paused: ['activate', 'archive'],
};

export const stateTransitionActions: () => Array<OfferingAction<OfferingStateTransition>> = () => [
  {
    key: 'state',
    value: 'activate',
    label: translate('Activate'),
  },
  {
    key: 'state',
    value: 'pause',
    label: translate('Pause'),
  },
  {
    key: 'state',
    value: 'archive',
    label: translate('Archive'),
  },
];

export const mainActions = () => [
  {
    key: 'update',
    value: 'update',
    label: translate('Edit'),
  },
];
