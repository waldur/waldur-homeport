import { FunctionComponent } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { OrderStateField } from './OrderStateField';

interface OrderDetailsHeaderTitleProps {
  order: any;
}
export const OrderDetailsHeaderTitle: FunctionComponent<
  OrderDetailsHeaderTitleProps
> = ({ order }) => {
  return (
    <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
      <div className="btn btn-flush d-flex align-items-center">
        <h3 className="text-start mb-0 me-2">
          {order.attributes.name || DASH_ESCAPE_CODE}
        </h3>
      </div>
      <CopyToClipboardButton
        value={order.attributes.name}
        className="text-hover-primary cursor-pointer"
        size={20}
      />

      <OrderStateField order={order} pill outline hasBullet size="sm" />
    </div>
  );
};
