import { BadgeShape, BadgeTone } from 'waldur-ui';

import { StateIndicator } from '@/core/StateIndicator';
import { translate } from '@/i18n';

import { ORDER_STATE_LABELS } from '../OrderStates';

export const OrderStateField = ({
  order,
  shape,
  tone,
  hasBullet = false,
  size = undefined,
}: {
  order: { state: string };
  shape?: BadgeShape;
  tone?: BadgeTone;
  hasBullet?: boolean;
  size?: 'sm' | 'lg';
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
      shape={shape}
      tone={tone}
      hasBullet={hasBullet}
      size={size}
    />
  );
};
