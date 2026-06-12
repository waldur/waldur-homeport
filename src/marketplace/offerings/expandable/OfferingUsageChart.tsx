import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import {
  marketplaceComponentUsageMonthlyList,
  ProviderOfferingDetails as Offering,
} from 'waldur-js-client';

import { generateColors } from '@/core/generateColors';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ResourceUsageTabs } from '@/marketplace/resources/usage/ResourceUsageTabs';

interface OfferingUsageChartProps {
  offering: Offering;
}

export const OfferingUsageChart: FunctionComponent<OfferingUsageChartProps> = ({
  offering,
}) => {
  const {
    isLoading: loading,
    error,
    data: usages,
  } = useQuery({
    queryKey: ['OfferingUsageChart', offering],

    queryFn: () =>
      marketplaceComponentUsageMonthlyList({
        query: {
          offering_uuid: offering.uuid,
          start: DateTime.now()
            .minus({ months: 12 })
            .startOf('month')
            .toFormat('yyyy-MM'),
          end: DateTime.now().endOf('month').toFormat('yyyy-MM'),
          field: [
            'component_type',
            'total_consumed',
            'total_allocated',
            'billing_period',
          ],
        },
      }).then((response) => response.data),
  });

  return (
    <Card className="card-bordered mb-10">
      <Card.Header>
        <Card.Title className="h5">
          {translate('Component usage chart')}
        </Card.Title>
      </Card.Header>
      <Card.Body
        className="mt-3 p-m"
        style={{ maxWidth: '500px', minWidth: '100%' }}
      >
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <>{translate('Unable to load data')}</>
        ) : (
          <ResourceUsageTabs
            components={offering.components}
            usages={usages}
            months={12}
            colors={generateColors(offering.components.length, {
              colorStart: 0.25,
              colorEnd: 0.65,
              useEndAsStart: true,
            })}
          />
        )}
      </Card.Body>
    </Card>
  );
};
