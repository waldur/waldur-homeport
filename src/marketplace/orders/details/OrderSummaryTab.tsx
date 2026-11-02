import { useMemo } from 'react';
import { OrderDetails, PublicOfferingDetails } from 'waldur-js-client';

import { PropertyItem, PropertyList } from 'waldur-ui';

import { Link } from '@/core/Link';
import { Panel } from '@/core/Panel';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';
import { SUPPORT_OFFERING_TYPE } from '@/support/constants';
import { useUser } from '@/workspace/hooks';

import { getOrderType } from '../utils';

import { ExportOrderComponentsButton } from './ExportOrderComponentsButton';
import { useOrderEditable } from './hooks';
import { ORDER_LIST_PROPS } from './type-based/OrderCommonFields';
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
      <div className="flex flex-col gap-2.5">
        <PropertyList {...ORDER_LIST_PROPS}>
          {user?.is_staff && (
            <PropertyItem label={translate('Order UUID')} value={order.uuid} />
          )}
          {user?.is_staff && (
            <PropertyItem label={translate('Order slug')} value={order.slug} />
          )}
          {order.offering_type === SUPPORT_OFFERING_TYPE && order.issue && (
            <PropertyItem
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

          <PropertyItem
            label={translate('Created by')}
            value={propVal.user({
              full_name: order.created_by_full_name,
              username: order.created_by_username,
            })}
          />
          <PropertyItem
            label={translate('Created at')}
            value={propVal.date(order.created, { precision: 'datetime' })}
          />
        </PropertyList>

        <OrderTypeBasedDetails
          order={order}
          offering={offering}
          editable={canEdit}
        />
      </div>
    </Panel>
  );
};
