import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import {
  marketplaceProviderOfferingsComponentStatsList,
  Offering,
  OfferingComponentStat,
} from 'waldur-js-client';

import { StatCardGrid, Tooltip } from 'waldur-ui';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { formatUsageValue } from '@/core/formatNumber';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ChangesAmountBadge } from '@/marketplace/service-providers/dashboard/ChangesAmountBadge';

interface OwnProps {
  offering: Offering;
}

// Use prefered order to display metrics
const preferedMetricsKeysOrder = [
  'cpu',
  'memory',
  'ram',
  'gpu',
  'storage',
  'disk',
  'process',
];

export const ComponentsUsage: FC<OwnProps> = ({ offering }) => {
  const {
    data: usages,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['summaryOfferingComponentsUsage', offering.uuid],
    queryFn: () =>
      offering.components.length
        ? getAllPages((page) =>
            marketplaceProviderOfferingsComponentStatsList({
              path: { uuid: offering.uuid },
              query: {
                page,
                page_size: MAX_PAGE_SIZE,
                start: DateTime.now()
                  .minus({ months: 2 })
                  .startOf('month')
                  .toFormat('yyyy-MM'),
                end: DateTime.now().endOf('month').toFormat('yyyy-MM'),
              },
            }),
          )
        : null,
  });

  const statistics = useMemo(() => {
    if (!usages || !usages.length) return [];

    // Group usages by component type
    const groupedUsages: Record<string, OfferingComponentStat[]> =
      usages.reduce((acc, usage) => {
        const { type } = usage;
        if (!acc[type]) {
          acc[type] = [];
        }
        acc[type].push(usage);
        return acc;
      }, {});

    // Calculate statistics for each component
    const currentMonth = DateTime.now().startOf('month').toFormat('yyyy-MM');
    const previousMonth = DateTime.now()
      .minus({ months: 1 })
      .startOf('month')
      .toFormat('yyyy-MM');
    const stats = Object.entries(groupedUsages).map(([componentType, data]) => {
      const currentMonthUsage = data.find((item) =>
        item.date.includes(currentMonth),
      );
      const previousMonthUsage = data.find((item) =>
        item.date.includes(previousMonth),
      );

      const component = offering.components.find(
        (comp) => comp.type === componentType,
      );

      let value = 0;
      let changes = undefined;
      const unit = component.measured_unit;

      value = Number(currentMonthUsage?.usage || 0);

      if (previousMonthUsage) {
        const previousUsage = Number(previousMonthUsage?.usage || 0);
        changes = previousUsage
          ? ((value - previousUsage) / previousUsage) * 100
          : undefined;
      }

      return {
        name: component?.name || componentType,
        type: componentType,
        value,
        changes,
        unit,
      };
    });

    // Sort statistics based on preferred order
    stats.sort((a, b) => {
      const aIndex = preferedMetricsKeysOrder.indexOf(a.type);
      const bIndex = preferedMetricsKeysOrder.indexOf(b.type);

      if (aIndex === -1 && bIndex === -1) return 0;
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

    return stats;
  }, [usages]);

  if (isLoading) {
    return <LoadingSpinner />;
  } else if (error) {
    return (
      <LoadingErred
        loadData={refetch}
        message={translate('Unable to load statistics')}
        className="mb-3"
      />
    );
  }

  if (!offering.components.length || !usages?.length) {
    return null;
  }

  return (
    <StatCardGrid
      stats={statistics.map((stat) => ({
        label: stat.name,
        value: (
          <>
            {formatUsageValue(stat.value, true)}
            {stat.unit && (
              <span className="ms-1 text-xl font-medium">{stat.unit}</span>
            )}
          </>
        ),
        footer: stat.changes ? (
          <Tooltip label={translate('Changes in the last month')}>
            <span>
              <ChangesAmountBadge
                changes={stat.changes}
                asBadge
                fractionDigits={0}
              />
            </span>
          </Tooltip>
        ) : undefined,
      }))}
    />
  );
};
