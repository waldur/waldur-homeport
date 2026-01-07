import { useMemo } from 'react';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { Link } from '@waldur/core/Link';
import { Panel } from '@waldur/core/Panel';
import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';
import { useUser } from '@waldur/workspace/hooks';

import { getOrderType } from '../utils';

import { ExportOrderComponentsButton } from './ExportOrderComponentsButton';
import { OrderTypeBasedDetails } from './type-based/OrderTypeBasedDetails';

export const OrderSummaryTab = ({
  order,
  offering,
}: {
  order: OrderDetails;
  offering: PublicOfferingDetails;
}) => {
  const user = useUser();
  const orderType = useMemo(() => getOrderType(order), [order]);

  return (
    <Panel
      title={translate('Order summary')}
      cardBordered
      actions={
        orderType.type === 'limits_update' && <ExportOrderComponentsButton />
      }
    >
      <div className="d-flex flex-column gap-3">
        {user?.is_staff && (
          <Field label={translate('Order UUID')} value={order.uuid} />
        )}
        {user?.is_staff && (
          <Field label={translate('Order slug')} value={order.slug} />
        )}
        {order.offering_type === SUPPORT_OFFERING_TYPE && order.issue && (
          <Field
            label={translate('Issue')}
            value={
              <Link
                state="support.detail"
                params={{ issue_uuid: order.issue.uuid }}
                className="text-link"
              >
                {order.issue.key || order.issue.uuid}
              </Link>
            }
          />
        )}

        <OrderTypeBasedDetails order={order} offering={offering} />
      </div>
    </Panel>
  );
};
