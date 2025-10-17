import { FunctionComponent } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import { formatJsx, translate } from '@waldur/i18n';
import { ResourceLink } from '@waldur/resource/ResourceLink';

import { OrderStateField } from './OrderStateField';

interface OrderDetailsHeaderTitleProps {
  order: any;
}
export const OrderDetailsHeaderTitle: FunctionComponent<
  OrderDetailsHeaderTitleProps
> = ({ order }) => {
  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-2 align-items-center">
        <div className="btn btn-flush d-flex align-items-center">
          <h3 className="text-start text-decoration-underline mb-0 me-2">
            {order.attributes.name}
          </h3>
        </div>
        <CopyToClipboardButton
          value={order.attributes.name}
          className="text-hover-primary cursor-pointer"
          size={20}
        />

        <OrderStateField order={order} pill outline hasBullet />
      </div>
      <div>
        {translate(
          'Part of <ResourceLink></ResourceLink>',
          {
            ResourceLink: () => (
              <ResourceLink
                uuid={order.marketplace_resource_uuid}
                label={order.resource_name}
              />
            ),
          },
          formatJsx,
        )}
      </div>
    </>
  );
};
