import { useMemo } from 'react';

import { HelpIcon, PropertyItem, PropertyList } from 'waldur-ui';

import { formatDate, parseCalendarDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { translate } from '@/i18n';
import { getFormLimitParser } from '@/marketplace/common/registry';
import { useShouldConcealPrices } from '@/marketplace/common/useShouldConcealPrices';
import { ChangedLimitField } from '@/marketplace/resources/change-limits/ChangedLimitField';
import {
  getLimitChangeData,
  getLimitChangeRequirements,
} from '@/marketplace/resources/change-limits/utils';
import { getLimitIncrease } from '@/marketplace/resources/renew-allocation/getLimitIncrease';
import { PriceTooltip } from '@/price/PriceTooltip';
import { propVal } from '@/property/propertyFields';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import { DetailsTable } from './DetailsTable';
import {
  ORDER_LIST_PROPS,
  OrderTypeBasedProps,
  RequestCommentField,
} from './OrderCommonFields';

// One priced line of the renewal, as the backend quoted and will invoice it.
interface RenewalCostLine {
  component_type: string;
  term: 'current_term' | 'extension';
  start: string;
  end: string;
  current_limit: string;
  new_limit: string;
  quantity: string;
  unit_price: string;
  total: string;
}

interface RenewalAttributes {
  action: 'renew';
  extension_months: number;
  new_end_date: string;
  old_end_date: string;
  old_limits: Record<string, any>;
  // Recorded on renewals placed since a raised limit is also charged for the
  // rest of the current term; older orders have none.
  cost_lines?: RenewalCostLine[];
}

const getTermLabel = (line: RenewalCostLine) =>
  line.term === 'current_term'
    ? translate('Rest of current term, {start} to {end}', {
        start: formatDate(parseCalendarDate(line.start)),
        end: formatDate(parseCalendarDate(line.end)),
      })
    : translate('Extension, {start} to {end}', {
        start: formatDate(parseCalendarDate(line.start)),
        end: formatDate(parseCalendarDate(line.end)),
      });

const getLineUnits = (line: RenewalCostLine) =>
  line.term === 'current_term'
    ? getLimitIncrease(line.current_limit, line.new_limit)
    : Number(line.new_limit);

export const ResourceRenewal = ({ order, offering }: OrderTypeBasedProps) => {
  const shouldConcealPrices = useShouldConcealPrices(
    order.project_uuid,
    order.customer_uuid,
  );
  const attributes = order.attributes as unknown as RenewalAttributes;
  const costLines = attributes.cost_lines;
  // The recorded lines carry the prices; an order placed before they were
  // recorded has none, and its cost is derived from the plan as before. An
  // empty list is a renewal that charges nothing.
  const showPlanPrices = !shouldConcealPrices && !costLines;

  const newLimits = useMemo(
    () => getFormLimitParser(offering.type)(order.limits),
    [offering.type, order.limits],
  );

  const data = useMemo(() => {
    const plan = offering.plans.find((p) => p.uuid === order.plan_uuid);
    const requirements = getLimitChangeRequirements(
      { limits: attributes.old_limits, current_usages: {} },
      offering,
      plan,
    );

    if (requirements) {
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
    };
  }, [order, offering, newLimits, attributes.old_limits]);

  // Renewal extends the resource lifetime by N months — the per-component price
  // we read from `row.price` is the monthly-equivalent value, so the cost for
  // the extension period is just price × months.
  const monthlyTotal = useMemo(
    () => data.periodTotals.find((r) => r.chargeMode === 'month')?.total ?? 0,
    [data.periodTotals],
  );

  return (
    <>
      <PropertyList {...ORDER_LIST_PROPS}>
        <PropertyItem
          label={translate('Old end date')}
          value={propVal.date(attributes.old_end_date)}
        />
        <PropertyItem
          label={translate('New end date')}
          value={propVal.date(attributes.new_end_date)}
        />
        <PropertyItem
          label={translate('Extension')}
          value={
            '+ ' +
            (attributes.extension_months === 1
              ? translate('1 month')
              : translate('{count} months', {
                  count: attributes.extension_months,
                }))
          }
        />
        {!shouldConcealPrices && costLines?.length === 0 ? (
          // Recorded with no priced lines: the renewal charges nothing.
          <PropertyItem
            label={translate('Total renewal cost')}
            value={propVal.currency(0)}
          />
        ) : null}
        <RequestCommentField order={order} />
      </PropertyList>

      <DetailsTable<(typeof data.components)[0]>
        rows={data.components}
        columns={[
          {
            title: translate('Component'),
            render: ({ row }) => (
              <>
                {row.name}
                <HelpIcon label={row.type} className="ms-1" />
              </>
            ),
            className: 'whitespace-nowrap',
          },
          {
            title: translate('Old limit'),
            render: ({ row }) => `${row.limit ?? 0} ${row.measured_unit}`,
          },
          {
            title: translate('New limit'),
            render: ({ row }) => newLimits[row.type] + ' ' + row.measured_unit,
          },
          {
            title: translate('Difference'),
            render: ({ row }) =>
              row.changedLimit ? (
                <ChangedLimitField
                  changedLimit={row.changedLimit}
                  unit={row.measured_unit}
                />
              ) : (
                DASH_ESCAPE_CODE
              ),
          },
          ...(!showPlanPrices
            ? []
            : [
                {
                  title: (
                    <>
                      {translate('Price per month')} <PriceTooltip />
                    </>
                  ),
                  render: ({ row }) =>
                    defaultCurrency(row.chargeMode === 'month' ? row.price : 0),
                },
                {
                  title: (
                    <>
                      {translate('Cost for {count} months', {
                        count: attributes.extension_months,
                      })}{' '}
                      <PriceTooltip />
                    </>
                  ),
                  render: ({ row }) =>
                    defaultCurrency(
                      (row.chargeMode === 'month' ? row.price : 0) *
                        attributes.extension_months,
                    ),
                },
              ]),
        ]}
        totalRow={(columnCount) =>
          !showPlanPrices ? null : (
            <tr className="font-semibold">
              <td colSpan={columnCount - 2} className="text-primary text-end">
                {translate('Total renewal cost')}
              </td>
              <td className="text-primary">{defaultCurrency(monthlyTotal)}</td>
              <td className="text-primary">
                {defaultCurrency(monthlyTotal * attributes.extension_months)}
              </td>
            </tr>
          )
        }
      />

      {!shouldConcealPrices && costLines?.length ? (
        <DetailsTable<RenewalCostLine>
          rows={costLines}
          columns={[
            {
              title: translate('Component'),
              render: ({ row }) =>
                data.components.find((c) => c.type === row.component_type)
                  ?.name ?? row.component_type,
              className: 'whitespace-nowrap',
            },
            {
              title: translate('Term'),
              render: ({ row }) => getTermLabel(row),
            },
            {
              // Units x months, so that it multiplies out with the monthly
              // price to the cost; the rest of a term is a fraction of months.
              title: translate('Units × months'),
              render: ({ row }) => {
                const units = getLineUnits(row);
                const months = units ? Number(row.quantity) / units : 0;
                return `${units} × ${Number(months.toFixed(2))}`;
              },
            },
            {
              title: (
                <>
                  {translate('Price per month')} <PriceTooltip />
                </>
              ),
              render: ({ row }) => defaultCurrency(row.unit_price),
            },
            {
              title: translate('Cost'),
              render: ({ row }) => defaultCurrency(row.total),
            },
          ]}
          totalRow={(columnCount) => (
            <tr className="font-semibold">
              <td colSpan={columnCount - 1} className="text-primary text-end">
                {translate('Total renewal cost')}
              </td>
              <td className="text-primary">
                {defaultCurrency(
                  costLines.reduce((sum, line) => sum + Number(line.total), 0),
                )}
              </td>
            </tr>
          )}
        />
      ) : null}
    </>
  );
};
