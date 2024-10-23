import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';

import { generateColors } from '@waldur/core/generateColors';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { getProviderOfferingComponentStats } from '@waldur/marketplace/offerings/expandable/api';
import { ResourceUsageTabs } from '@waldur/marketplace/resources/usage/ResourceUsageTabs';
import { Offering } from '@waldur/marketplace/types';

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
  } = useAsync(async () => {
    const usages = await getProviderOfferingComponentStats(offering.uuid, {
      params: {
        start: DateTime.now()
          .minus({ months: 12 })
          .startOf('month')
          .toFormat('yyyy-MM'),
        end: DateTime.now().endOf('month').toFormat('yyyy-MM'),
      },
    });
    return usages;
  }, [offering]);

  return (
    <Card className="mb-10">
      <Card.Header className="border-2 border-bottom">
        <div className="card-toolbar">
          <Card.Title className="h5">
            {translate('Component usage chart')}
          </Card.Title>
        </div>
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
