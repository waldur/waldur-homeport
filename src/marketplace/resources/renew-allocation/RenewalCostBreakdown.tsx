import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import {
  RenewalEstimateComponent,
  Resource,
  projectsRetrieve,
} from 'waldur-js-client';

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from 'waldur-ui';

import { STALE_TIME } from '@/core/constants';
import { formatDate, parseCalendarDate } from '@/core/dateUtils';
import { defaultCurrency } from '@/core/formatCurrency';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { isFeatureVisible } from '@/features/connect';
import { MarketplaceFeatures } from '@/FeaturesEnums';
import { translate } from '@/i18n';

import { getLimitIncrease } from './getLimitIncrease';
import { useRenewalEstimate } from './useRenewalEstimate';

interface RenewalCostBreakdownProps {
  resource: Resource;
  extensionMonths: number;
}

const daysBetween = (start: string, end: string) =>
  Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);

const CurrentTermRow: FC<{ item: RenewalEstimateComponent }> = ({ item }) => {
  const increase = getLimitIncrease(item.current_limit, item.new_limit);
  const days =
    item.period_start && item.period_end
      ? daysBetween(item.period_start, item.period_end)
      : 0;
  return (
    <TableRow>
      <TableCell>
        {item.component_name} (+{increase})
        <div className="text-quaternary small">
          {translate('Rest of current term, until {date}', {
            date: formatDate(parseCalendarDate(item.period_end)),
          })}
        </div>
      </TableCell>
      <TableCell className="text-quaternary">
        {defaultCurrency(item.unit_price)}/{translate('mo')}
        {' × '}
        {increase} {item.measured_unit}
        {' × 12 × '}
        {translate('{days} days', { days })}
        {' / 365'}
      </TableCell>
      <TableCell className="text-end whitespace-nowrap">
        {defaultCurrency(item.total)}
      </TableCell>
    </TableRow>
  );
};

// Up to two decimals: the backend keeps the formula's exact result.
export const formatDiscountPercent = (percent: string | number) =>
  Number(Number(percent).toFixed(2));

// The volume discount the invoice will give the line above it, as the backend
// priced it for the new limit.
const DiscountRow: FC<{ item: RenewalEstimateComponent }> = ({ item }) =>
  Number(item.discount_total) > 0 ? (
    <TableRow>
      <TableCell colSpan={2} className="text-success">
        <span className="ps-4">
          {'↳ '}
          {translate('{percent}% volume discount', {
            percent: formatDiscountPercent(item.discount_percent),
          })}
        </span>
      </TableCell>
      <TableCell className="text-end whitespace-nowrap text-success">
        {'− '}
        {defaultCurrency(item.discount_total)}
      </TableCell>
    </TableRow>
  ) : null;

const ComponentPriceRow: FC<{ item: RenewalEstimateComponent }> = ({
  item,
}) => {
  if (item.term === 'current_term') {
    return <CurrentTermRow item={item} />;
  }
  const delta =
    item.billing_type === 'limit'
      ? ` (+${getLimitIncrease(item.current_limit, item.new_limit)})`
      : '';
  return (
    <TableRow>
      <TableCell>
        {item.component_name}
        {delta}
        {item.term === 'extension' && item.period_start && item.period_end ? (
          <div className="text-quaternary small">
            {translate('Extension, {start} to {end}', {
              start: formatDate(parseCalendarDate(item.period_start)),
              end: formatDate(parseCalendarDate(item.period_end)),
            })}
          </div>
        ) : null}
      </TableCell>
      <TableCell className="text-quaternary">
        {defaultCurrency(item.unit_price)}/
        {item.billing_type === 'prepaid'
          ? translate('mo')
          : item.billing_period === 'annual'
            ? translate('yr')
            : item.billing_period === 'quarterly'
              ? translate('qtr')
              : translate('mo')}
        {' × '}
        {item.new_limit} {item.measured_unit}
        {' × '}
        {item.period_description}
      </TableCell>
      <TableCell className="text-end whitespace-nowrap">
        {defaultCurrency(item.total)}
      </TableCell>
    </TableRow>
  );
};

const ComponentRow: FC<{ item: RenewalEstimateComponent }> = ({ item }) => (
  <>
    <ComponentPriceRow item={item} />
    <DiscountRow item={item} />
  </>
);

export const RenewalCostBreakdown: FC<RenewalCostBreakdownProps> = ({
  resource,
  extensionMonths,
}) => {
  const { data: project } = useQuery({
    queryKey: ['display-project-billing', resource.project_uuid],
    queryFn: () =>
      resource.project_uuid
        ? projectsRetrieve({
            path: { uuid: resource.project_uuid },
            query: { field: ['customer_display_billing_info_in_projects'] },
          }).then((response) => response.data)
        : null,
    refetchOnWindowFocus: false,
    staleTime: STALE_TIME,
  });

  const shouldConcealPrices =
    isFeatureVisible(MarketplaceFeatures.conceal_prices) ||
    project?.customer_display_billing_info_in_projects === false;
  const { data, isLoading } = useRenewalEstimate(resource, extensionMonths);

  if (shouldConcealPrices) return null;
  if (isLoading) return <LoadingSpinner />;
  // Before discounts: a renewal discounted to nothing still shows its lines.
  if (
    !data ||
    parseFloat(data.subscription_total) +
      parseFloat(data.limit_change_total) ===
      0
  )
    return null;

  const subscriptionItems = data.components.filter(
    (c) => c.billing_type === 'prepaid',
  );
  const limitItems = data.components.filter((c) => c.billing_type === 'limit');

  return (
    <div className="mt-3">
      <h6 className="mb-2.5">{translate('Estimated cost breakdown')}</h6>
      <Table density="compact" scrollable={false}>
        <TableHeader>
          <TableRow className="border-b border-b-secondary">
            <TableHead>{translate('Component')}</TableHead>
            <TableHead>{translate('Details')}</TableHead>
            <TableHead className="text-end">{translate('Cost')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptionItems.map((item) => (
            <ComponentRow
              key={`${item.component_type}-${item.term ?? ''}`}
              item={item}
            />
          ))}
          {subscriptionItems.length > 0 && limitItems.length > 0 && (
            <TableRow className="border-t border-t-secondary">
              <TableCell colSpan={2} className="text-end text-quaternary small">
                {translate('Subscription subtotal')}
              </TableCell>
              <TableCell className="text-end whitespace-nowrap">
                {/* The discounts are on prepaid lines, so they come off here. */}
                {defaultCurrency(
                  parseFloat(data.subscription_total) -
                    parseFloat(data.discount_total),
                )}
              </TableCell>
            </TableRow>
          )}
          {limitItems.map((item) => (
            <ComponentRow key={item.component_type} item={item} />
          ))}
          {limitItems.length > 0 && subscriptionItems.length > 0 && (
            <TableRow className="border-t border-t-secondary">
              <TableCell colSpan={2} className="text-end text-quaternary small">
                {translate('Limit change subtotal')}
              </TableCell>
              <TableCell className="text-end whitespace-nowrap">
                {defaultCurrency(data.limit_change_total)}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow className="border-t border-t-secondary">
            <TableCell colSpan={2} className="text-end font-medium">
              {translate('Total')}
            </TableCell>
            <TableCell className="text-end whitespace-nowrap font-medium text-base">
              {defaultCurrency(data.total)}
            </TableCell>
          </TableRow>
          {data.discount_deferred ? (
            // Aggregated over the organization's resources, so only the month's
            // invoice can price it.
            <TableRow>
              <TableCell colSpan={3} className="text-end text-quaternary small">
                {translate('Volume discount applied on your invoice')}
              </TableCell>
            </TableRow>
          ) : null}
        </TableFooter>
      </Table>
    </div>
  );
};
