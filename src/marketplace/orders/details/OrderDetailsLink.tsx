import { FunctionComponent } from 'react';

import { Link } from '@waldur/core/Link';

export const OrderDetailsLink: FunctionComponent<any> = (props) => (
  <Link
    state="marketplace-orders.details"
    params={{ order_uuid: props.order_uuid }}
    className={props.className}
    onClick={props.onClick}
  >
    {props.children}
  </Link>
);
