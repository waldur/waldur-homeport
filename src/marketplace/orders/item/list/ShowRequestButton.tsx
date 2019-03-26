import * as React from 'react';

import { translate } from '@waldur/i18n';
import { OrderDetailsLink } from '@waldur/marketplace/orders/OrderDetailsLink';

export const ShowRequestButton = ({ row }) => (
  <OrderDetailsLink
    order_uuid={row.order_uuid}
    customer_uuid={row.customer_uuid}
    project_uuid={row.project_uuid}
    className="btn btn-default btn-sm">
    {translate('Show request')}
  </OrderDetailsLink>
);
