import { translate } from '@waldur/i18n';

import { OrderDetailsType, OrderState } from '../types';

export const OrderStateCell = ({ row }: { row: OrderDetailsType }) => (
  <>
    {
      (
        {
          'pending-consumer': translate('Pending consumer review'),
          'pending-provider': translate('Pending provider review'),
          executing: translate('Executing'),
          done: translate('Done'),
          erred: translate('Erred'),
          canceled: translate('Canceled'),
          rejected: translate('Rejected'),
        } as Record<OrderState, string>
      )[row.state]
    }
  </>
);
