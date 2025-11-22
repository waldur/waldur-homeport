import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';
import {
  marketplaceProviderOfferingsComponentStatsList,
  Offering,
  OfferingComponentStat,
} from 'waldur-js-client';

import { getAllPages } from '@waldur/core/api';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { StatisticsCard } from './StatisticsCard';

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
        className="mb-4"
      />
    );
  }

  if (!offering.components.length || !usages?.length) {
    return null;
  }

  return (
    <Row>
      {statistics.map((stat) => (
        <Col key={stat.type} xl={3} sm={6}>
          <StatisticsCard
            title={stat.name}
            value={stat.value}
            unit={stat.unit}
            changes={stat.changes}
          />
        </Col>
      ))}
    </Row>
  );
};
