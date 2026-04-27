import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

import { ORDER_STATE_LABELS } from '../OrderStates';

export const OrderStateField = ({
  order,
  pill,
  outline,
  hasBullet = false,
  size = undefined,
}) => {
  return (
    <StateIndicator
      label={ORDER_STATE_LABELS[order.state] || translate('Unknown state')}
      variant={
        order.state === 'erred'
          ? 'danger'
          : order.state === 'executing'
            ? 'primary'
            : order.state === 'done'
              ? 'success'
              : 'warning'
      }
      active={false}
      pill={pill}
      outline={outline}
      hasBullet={hasBullet}
      size={size}
    />
  );
};
