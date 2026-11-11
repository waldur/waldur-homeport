import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { Resource, OfferingComponent } from 'waldur-js-client';

import { SegmentedControl } from 'waldur-ui';

import { LoadingSpinner } from '@/core/LoadingSpinner';
import { OWN_ERROR_STATE } from '@/core/queryRetry';
import { translate } from '@/i18n';
import {
  fetchOrderPeriodUsage,
  formatOrderPeriod,
  formatOrderPeriodHint,
  getOrderPeriodComponentTypes,
  getOrderPeriodResource,
  showsOrderPeriodTotals,
  supportsOrderPeriodTotals,
} from '@/marketplace/common/orderPeriodTotals';

import { ResourceDisplayLimits } from '../types';

import {
  getResourceComponentEntries,
  ResourceComponentItem,
} from './ResourceComponentItem';
import { ResourceShowMoreComponents } from './ResourceShowMoreComponents';

type ComponentsResource = Pick<
  Resource,
  'name' | 'current_usages' | 'limits' | 'limit_usage'
> &
  Partial<
    Pick<
      Resource,
      | 'spending_limit_status'
      | 'uuid'
      | 'created'
      | 'end_date'
      | 'offering_plugin_options'
      | 'offering_type'
    >
  > &
  ResourceDisplayLimits;

type Period = 'current' | 'order';

/**
 * The quota grid, with a switch to the whole order period when the offering
 * offers it and the order has an end date. The totals are fetched only once
 * the switch is used, from the route of the side the page is viewed from.
 */
export const ResourceComponents = ({
  resource,
  components,
  providerView = false,
}: {
  resource: ComponentsResource;
  components: OfferingComponent[];
  providerView?: boolean;
}) => {
  const [period, setPeriod] = useState<Period>('current');
  const orderTypes = useMemo(
    () => getOrderPeriodComponentTypes(components),
    [components],
  );
  const canShowOrder =
    showsOrderPeriodTotals(resource.offering_plugin_options) &&
    supportsOrderPeriodTotals(resource.offering_type) &&
    Boolean(resource.uuid && resource.created && resource.end_date) &&
    orderTypes.length > 0;
  const showOrder = canShowOrder && period === 'order';
  const { data, isLoading, isError } = useQuery({
    queryKey: [
      'marketplace-resource-order-period-usage',
      resource.uuid,
      providerView,
    ],
    queryFn: () => fetchOrderPeriodUsage(resource.uuid, providerView),
    enabled: showOrder,
    // A failure shows inline below the switch rather than leaving the page.
    meta: OWN_ERROR_STATE,
  });
  const orderView = useMemo(
    () =>
      showOrder && data
        ? getOrderPeriodResource(resource, data, orderTypes)
        : null,
    [showOrder, data, resource, orderTypes],
  );

  const orderPeriod = orderView
    ? formatOrderPeriod(resource.created, resource.end_date)
    : undefined;
  const orderPeriodHint = orderView
    ? formatOrderPeriodHint(orderView.months)
    : undefined;

  const grid = orderView ? (
    <ComponentsGrid
      resource={orderView.resource}
      components={components}
      orderTypes={orderView.types}
      orderPeriod={orderPeriod}
      orderPeriodHint={orderPeriodHint}
    />
  ) : showOrder && isError ? (
    <p className="text-danger mb-0">
      {translate('Unable to load usage for the whole order.')}
    </p>
  ) : showOrder && isLoading ? (
    <LoadingSpinner />
  ) : (
    <ComponentsGrid resource={resource} components={components} />
  );

  if (!canShowOrder) {
    return grid;
  }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
        {orderView?.types.length > 0 && (
          // Visible in every layout: a grid card carries the period only in
          // its tooltip.
          <span className="text-secondary text-sm">
            {[orderPeriod, orderPeriodHint].join(' · ')}
          </span>
        )}
        <SegmentedControl<Period>
          aria-label={translate('Usage period')}
          options={[
            // Not "this month": a quarterly or annual limit shows its own
            // period here.
            { value: 'current', label: translate('Current period') },
            { value: 'order', label: translate('Whole order') },
          ]}
          value={period}
          onValueChange={setPeriod}
        />
      </div>
      {grid}
    </div>
  );
};

const ComponentsGrid = ({
  resource,
  components,
  orderTypes,
  orderPeriod,
  orderPeriodHint,
}: {
  resource: ComponentsResource;
  components: OfferingComponent[];
  orderTypes?: string[];
  orderPeriod?: string;
  orderPeriodHint?: string;
}) => {
  const entries = getResourceComponentEntries(resource, components);
  const periodProps = (type: string) =>
    orderTypes?.includes(type) ? { orderPeriod, orderPeriodHint } : {};
  if (entries.length <= 2) {
    return (
      <div
        className={
          entries.length === 2
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3'
            : 'grid grid-cols-1 gap-x-5 gap-y-3'
        }
      >
        {entries.map((entry) => (
          <div key={entry.key}>
            <ResourceComponentItem
              expanded
              stacked={entries.length === 2}
              resource={resource}
              component={entry.component}
              spendingLimit={entry.spendingLimit}
              thisMonth={entry.thisMonth}
              noUsageThisMonth={entry.noUsageThisMonth}
              {...periodProps(entry.component.type)}
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2 gap-x-5">
        {entries.slice(0, 4).map((entry) => (
          <div key={entry.key}>
            <ResourceComponentItem
              resource={resource}
              component={entry.component}
              spendingLimit={entry.spendingLimit}
              thisMonth={entry.thisMonth}
              noUsageThisMonth={entry.noUsageThisMonth}
              {...periodProps(entry.component.type)}
            />
          </div>
        ))}
      </div>
      {entries.length > 4 && (
        <div className="grow flex items-end mt-4">
          <ResourceShowMoreComponents
            resource={resource}
            components={components}
            orderTypes={orderTypes}
            orderPeriod={orderPeriod}
            orderPeriodHint={orderPeriodHint}
          />
        </div>
      )}
    </>
  );
};
