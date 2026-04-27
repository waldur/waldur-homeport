import { ArrowRightIcon } from '@phosphor-icons/react';
import { Resource } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { formatDate } from '@/core/dateUtils';
import { translate } from '@/i18n';
import { OrderDetailsQuickBody } from '@/marketplace/orders/details/OrderDetailsQuickBody';
import { Field } from '@/resource/summary';

import { CostEstimatedChangeView } from './CostEstimatedChangeView';

export const ResourcePlanChangeInfo = ({
  resource,
}: {
  resource: Resource;
}) => {
  const order = resource.order_in_progress;

  return (
    <>
      <Field
        label={translate('Created by')}
        value={order.created_by_full_name + ` (${order.created_by_username})`}
        space={2}
      />
      <Field
        label={translate('Created at')}
        value={formatDate(order.created)}
        space={2}
      />
      <OrderDetailsQuickBody order={order} space={2} />
      <Field
        label={translate('Plan change')}
        valueClass="d-flex align-items-center gap-2"
        value={
          <>
            <Badge variant="blue" pill outline>
              {order.old_plan_name}
            </Badge>
            <ArrowRightIcon weight="bold" />
            <Badge variant="warning" pill outline>
              {order.new_plan_name}
            </Badge>
          </>
        }
        space={2}
      />

      <p className="text-quaternary my-6">
        {translate(
          'Estimated cost impact depends on pricing model of the new plan',
        )}
      </p>

      <CostEstimatedChangeView
        order={order}
        message={
          order.plan_unit === 'hour'
            ? translate('New hourly plan fee')
            : order.plan_unit === 'day'
              ? translate('New daily plan fee')
              : order.plan_unit === 'half_month'
                ? translate('New half month plan fee')
                : order.plan_unit === 'month'
                  ? translate('New monthly plan fee')
                  : order.plan_unit === 'quarter'
                    ? translate('New quarterly plan fee')
                    : translate('New {period} plan fee', {
                        period: order.plan_unit,
                      })
        }
      />
    </>
  );
};
