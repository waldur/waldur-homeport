import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { Card } from 'react-bootstrap';
import { useAsync } from 'react-use';
import { marketplaceProviderOfferingsComponentStatsList } from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { generateColors } from '@waldur/core/generateColors';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
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
  } = useAsync(
    () =>
      getAllPages((page) =>
        marketplaceProviderOfferingsComponentStatsList({
          path: { uuid: offering.uuid },
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            start: DateTime.now()
              .minus({ months: 12 })
              .startOf('month')
              .toFormat('yyyy-MM'),
            end: DateTime.now().endOf('month').toFormat('yyyy-MM'),
          },
        }),
      ),
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
