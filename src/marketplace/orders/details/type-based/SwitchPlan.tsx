import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { Badge } from '@/core/Badge';
import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { useShouldConcealPrices } from '@/marketplace/common/useShouldConcealPrices';
import { toPlanBilling } from '@/marketplace/details/plan/billingMode';
import { PlanBillingModeBadge } from '@/marketplace/details/plan/PlanBillingModeBadge';
import { getPlanSwitchData } from '@/marketplace/resources/change-plan/utils';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { Field } from '@/resource/summary';

import { getPlanUnitAbbr } from '../../utils';

import { DetailsTable } from './DetailsTable';
import {
  CostChangeField,
  OrderTypeBasedProps,
  RequestCommentField,
  RequestedByField,
  StartDateField,
} from './OrderCommonFields';

export const SwitchPlan = ({ order, offering }: OrderTypeBasedProps) => {
  const shouldConcealPrices = useShouldConcealPrices(order.project_uuid);
  const data = useMemo(
    () => getPlanSwitchData(order, offering),
    [order, offering],
  );

  return (
    <>
      <RequestedByField order={order} />
      <RequestCommentField order={order} />
      <StartDateField order={order} />

      <Field
        label={translate('Plan old')}
        labelWidth={200}
        value={
          <span className="d-inline-flex align-items-center gap-2">
            <Badge variant="default" pill outline>
              {order.old_plan_name}
            </Badge>
            <PlanBillingModeBadge
              mode={toPlanBilling(order.old_plan_billing_mode)}
            />
          </span>
        }
      />
      <Field
        label={translate('Plan new')}
        labelWidth={200}
        value={
          <span className="d-inline-flex align-items-center gap-2">
            <Badge variant="moss" pill outline>
              {order.new_plan_name}
            </Badge>
            <PlanBillingModeBadge
              mode={toPlanBilling(order.new_plan_billing_mode)}
            />
          </span>
        }
      />
      <CostChangeField
        order={order}
        shouldConcealPrices={shouldConcealPrices}
      />

      <DetailsTable<(typeof data.components)[0]>
        rows={data.components}
        columns={[
          {
            title: translate('Component'),
            render: ({ row }) => (
              <>
                {row.name}
                <Tip label={row.type} id={'tip-' + row.type} className="ms-1">
                  <QuestionIcon weight="bold" />
                </Tip>
              </>
            ),
            className: 'text-nowrap',
          },
          {
            title: translate('Limit'),
            render: ({ row }) =>
              row.oldBillingType === 'limit' || row.newBillingType === 'limit'
                ? `${row.limit ?? 0} ${row.measured_unit}`
                : translate('Not limited'),
          },
          ...(shouldConcealPrices
            ? []
            : [
                {
                  title: translate('Old price'),
                  render: ({ row }) =>
                    row.oldBillingType === 'usage'
                      ? translate('Usage-based · {price} per {unit}', {
                          price: defaultCurrency(row.oldPrice),
                          unit: row.oldMeasuredUnit,
                        })
                      : defaultCurrency(row.oldSubTotal),
                },
                {
                  title: translate('New price'),
                  render: ({ row }) =>
                    row.newBillingType === 'usage'
                      ? translate('Usage-based · {price} per {unit}', {
                          price: defaultCurrency(row.newPrice),
                          unit: row.newMeasuredUnit,
                        })
                      : defaultCurrency(row.newSubTotal),
                },
                {
                  title: translate('Difference price'),
                  render: ({ row }) =>
                    !row.bothLimit ? (
                      <>&mdash;</>
                    ) : (
                      <>
                        <span className="me-3">
                          {defaultCurrency(row.changedSubTotal)}
                        </span>
                        <ChangesAmountBadge
                          changes={row.changedSubTotalPrc}
                          showSign
                          asBadge
                          badgePill
                          badgeOutline
                          badgeSm
                          reverseColor
                          fractionDigits={0}
                        />
                      </>
                    ),
                },
              ]),
        ]}
        totalRow={(columnCount) =>
          shouldConcealPrices ? null : (
            <>
              <tr className="fw-bolder">
                <td colSpan={columnCount - 1} className="text-dark text-end">
                  {translate('Total cost')}
                </td>
                <td className="text-dark">
                  {defaultCurrency(data.changedTotalPeriods[0], false, true)}
                  {getPlanUnitAbbr(order.plan_unit)}
                </td>
              </tr>
              {data.hasUsageSide && (
                <tr>
                  <td colSpan={columnCount} className="text-muted fs-7">
                    {translate(
                      'Usage-based components are billed on consumption and are not included in the total.',
                    )}
                  </td>
                </tr>
              )}
            </>
          )
        }
      />
    </>
  );
};
