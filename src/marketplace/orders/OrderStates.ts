import { OrderState } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

export const ORDER_STATE_LABELS: Record<OrderState, string> = {
  'pending-consumer': translate('Pending consumer approval'),
  'pending-provider': translate('Pending provider approval'),
  'pending-project': translate('Pending project start'),
  executing: translate('Executing'),
  done: translate('Done'),
  erred: translate('Erred'),
  canceled: translate('Canceled'),
  rejected: translate('Rejected'),
};

export const createOrderStateOptions = () =>
  Object.keys(ORDER_STATE_LABELS).map((state) => ({
    value: state,
    label: translate(ORDER_STATE_LABELS[state]),
  })) as {
    value: OrderState;
    label: string;
  }[];
