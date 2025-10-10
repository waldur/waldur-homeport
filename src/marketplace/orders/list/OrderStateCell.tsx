import { OrderDetails } from 'waldur-js-client';

import { translate } from '@waldur/i18n';

import { ORDER_STATE_LABELS } from '../OrderStates';

export const OrderStateCell = ({ row }: { row: OrderDetails }) => (
  <>{ORDER_STATE_LABELS[row.state] || translate('Unknown state')}</>
);
