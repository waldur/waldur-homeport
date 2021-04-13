import { translate } from '@waldur/i18n';

export const OrderItemStateCell = ({ row }) =>
  ({
    pending: translate('Pending'),
    executing: translate('Executing'),
    done: translate('Done'),
    erred: translate('Erred'),
    terminating: translate('Terminating'),
    terminated: translate('Terminated'),
  }[row.state] || row.state);
