import { useMemo } from 'react';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { Link } from '@/core/Link';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { SUPPORT_OFFERING_TYPE } from '@/support/constants';
import { useUser } from '@/workspace/hooks';

import { getOrderType } from '../utils';

import { ExportOrderComponentsButton } from './ExportOrderComponentsButton';
import { useOrderEditable } from './hooks';
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

  const canEdit = useOrderEditable(order);

  return (
    <Panel
      title={translate('Summary')}
      cardBordered
      actions={
        orderType.type === 'limits_update' && <ExportOrderComponentsButton />
      }
    >
      <div className="d-flex flex-column gap-3">
        {user?.is_staff && (
          <Field
            label={translate('Order UUID')}
            value={order.uuid}
            labelWidth={200}
          />
        )}
        {user?.is_staff && (
          <Field
            label={translate('Order slug')}
            value={order.slug}
            labelWidth={200}
          />
        )}
        {order.offering_type === SUPPORT_OFFERING_TYPE && order.issue && (
          <Field
            label={translate('Issue')}
            labelWidth={200}
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

        <OrderTypeBasedDetails
          order={order}
          offering={offering}
          editable={canEdit}
        />
      </div>
    </Panel>
  );
};
