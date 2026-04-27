import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { generateColors } from '@/core/generateColors';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ResourceUsageTabs } from '@/marketplace/resources/usage/ResourceUsageTabs';
import { Offering } from '@/marketplace/types';

import { getComponentUsageMonthlyList } from '../api';

interface OfferingUsageChartProps {
  offering: Offering;
}

export const OfferingUsageChart: FunctionComponent<OfferingUsageChartProps> = ({
  offering,
}) => {
  const {
    loading,
    error,
    value: usages,
  } = useAsync(
    () =>
      getComponentUsageMonthlyList({
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
    [offering],
  );

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
            usages={usages as any}
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
