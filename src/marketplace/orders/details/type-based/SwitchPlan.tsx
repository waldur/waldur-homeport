import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { Badge } from '@waldur/core/Badge';
import { defaultCurrency } from '@waldur/core/formatCurrency';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { useShouldConcealPrices } from '@waldur/marketplace/common/useShouldConcealPrices';
import { getPlanSwitchData } from '@waldur/marketplace/resources/change-plan/utils';
import { ChangesAmountBadge } from '@waldur/marketplace/service-providers/dashboard/ChangesAmountBadge';
import { Field } from '@waldur/resource/summary';

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
        value={
          <Badge variant="default" pill outline>
            {order.old_plan_name}
          </Badge>
        }
      />
      <Field
        label={translate('Plan new')}
        value={
          <Badge variant="moss" pill outline>
            {order.new_plan_name}
          </Badge>
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
            render: ({ row }) => `${row.limit ?? 0} ${row.measured_unit}`,
          },
          ...(shouldConcealPrices
            ? []
            : [
                {
                  title: translate('Old price'),
                  render: ({ row }) => defaultCurrency(row.oldSubTotal),
                },
                {
                  title: translate('New price'),
                  render: ({ row }) => defaultCurrency(row.newSubTotal),
                },
                {
                  title: translate('Difference price'),
                  render: ({ row }) => (
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
            <tr className="fw-bolder">
              <td colSpan={columnCount - 1} className="text-dark text-end">
                {translate('Total cost')}
              </td>
              <td className="text-dark">
                {defaultCurrency(data.changedTotalPeriods[0], false, true)}
                {getPlanUnitAbbr(order.plan_unit)}
              </td>
            </tr>
          )
        }
      />
    </>
  );
};
