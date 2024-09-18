import { StateIndicator } from '@waldur/core/StateIndicator';

export const OrderStateField = ({ order, pill, outline, hasBullet }) => {
  return (
    <StateIndicator
      label={order.state}
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
    />
  );
};
