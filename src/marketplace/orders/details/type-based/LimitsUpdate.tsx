import { QuestionIcon } from '@phosphor-icons/react';
import { useMemo } from 'react';

import { defaultCurrency } from '@/core/formatCurrency';
import { Tip } from '@/core/Tooltip';
import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { useShouldConcealPrices } from '@/marketplace/common/useShouldConcealPrices';
import {
  getLimitChangeRequirements,
  getLimitChangeData,
} from '@/marketplace/resources/change-limits/utils';
import { PriceTooltip } from '@/price/PriceTooltip';

import { DetailsTable, ValueIndicator } from './DetailsTable';
import {
  OrderTypeBasedProps,
  RequestedByField,
  RequestCommentField,
  DescriptionField,
  CostChangeField,
} from './OrderCommonFields';

export const LimitsUpdate = ({ order, offering }: OrderTypeBasedProps) => {
  const shouldConcealPrices = useShouldConcealPrices(order.project_uuid);
  const data = useMemo(() => {
    const requirements = getLimitChangeRequirements(
      { limits: (order.attributes as any).old_limits },
      offering,
    );
    const limitParser = getFormLimitParser(order.offering_type);
    const resourceLimits = limitParser(order.limits);

    if (requirements) {
      const newLimits = resourceLimits;
      const plan = offering.plans.find((p) => p.uuid === order.plan_uuid);
      if (!plan) {
        return {
          components: [],
          periodTotals: [],
          orderCanBeApproved: true,
          offering,
          newLimits: resourceLimits,
        };
      }
      const { usages, limits: currentLimits } = requirements;
      return getLimitChangeData(
        plan,
        offering,
        newLimits,
        currentLimits,
        usages,
        true,
      );
    }
    return {
      components: [],
      periodTotals: [],
      orderCanBeApproved: true,
      offering,
      newLimits: resourceLimits,
    };
  }, [order, offering]);

  return (
    <>
      <RequestedByField order={order} />
      <RequestCommentField order={order} />
      <DescriptionField order={order} offering={offering} />
      <CostChangeField
        order={order}
        shouldConcealPrices={shouldConcealPrices}
      />

      <DetailsTable<(typeof data.components)[0]>
        rows={data.components}
        columns={[
          {
            title: translate('Limit'),
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
            title: translate('Old'),
            render: ({ row }) => `${row.limit ?? 0} ${row.measured_unit}`,
          },
          {
            title: translate('New'),
            render: ({ row }) =>
              data.newLimits[row.type] + ' ' + row.measured_unit,
          },
          {
            title: translate('Change'),
            render: ({ row }) => {
              const oldValue = row.limit ?? 0;
              const newValue = data.newLimits[row.type];
              const change = newValue - oldValue;
              const isPositive = change > 0;
              return (
                <ValueIndicator
                  value={`${Math.abs(change)} ${row.measured_unit}`}
                  isPositive={isPositive}
                  isZero={change === 0}
                />
              );
            },
          },
          ...(shouldConcealPrices
            ? []
            : [
                {
                  title: (
                    <>
                      {translate('Old price')}
                      <PriceTooltip />
                    </>
                  ),
                  render: ({ row }) =>
                    defaultCurrency(row.price - row.changedPrice) +
                    row.priceSuffix,
                },
                {
                  title: (
                    <>
                      {translate('New price')}
                      <PriceTooltip />
                    </>
                  ),
                  render: ({ row }) =>
                    defaultCurrency(row.price) + row.priceSuffix,
                },
                {
                  title: translate('Impact'),
                  render: ({ row }) => {
                    const priceChange = row.changedPrice;
                    const isPositive = priceChange > 0;
                    return (
                      <ValueIndicator
                        value={
                          defaultCurrency(Math.abs(priceChange)) +
                          row.priceSuffix
                        }
                        isPositive={isPositive}
                        isZero={priceChange === 0}
                      />
                    );
                  },
                },
              ]),
        ]}
        totalRow={(columnCount) =>
          shouldConcealPrices || data.periodTotals.length === 0 ? null : (
            <>
              {data.periodTotals.map((row) => (
                <tr className="fw-bolder" key={row.chargeMode}>
                  <td colSpan={columnCount - 1} className="text-dark text-end">
                    {translate('{label} change', { label: row.label })}
                  </td>
                  <td className="text-dark">
                    {defaultCurrency(row.changedTotal, false, true)}
                    {row.priceSuffix}
                  </td>
                </tr>
              ))}
            </>
          )
        }
      />
    </>
  );
};
