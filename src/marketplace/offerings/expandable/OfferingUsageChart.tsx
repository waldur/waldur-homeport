import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { generateColors } from '@waldur/customer/divisions/utils';
import { translate } from '@waldur/i18n';
import { getOfferingComponentStats } from '@waldur/marketplace/offerings/expandable/api';
import { ResourceUsageTabs } from '@waldur/marketplace/resources/usage/ResourceUsageTabs';
import { OfferingComponent } from '@waldur/marketplace/types';

interface OfferingUsageChartProps {
  offeringUuid: string;
  components: OfferingComponent[];
}

export const OfferingUsageChart: FunctionComponent<OfferingUsageChartProps> = ({
  offeringUuid,
  components,
}) => {
  const { loading, error, value: usages } = useAsync(
    () => getOfferingComponentStats(offeringUuid),
    [offeringUuid],
  );
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <div
      className="ibox-content m-t-md p-m"
      style={{ maxWidth: '500px', minWidth: '100%' }}
    >
      <ResourceUsageTabs
        components={components}
        usages={usages}
        colors={generateColors(components.length, {
          colorStart: 0.25,
          colorEnd: 0.65,
          useEndAsStart: true,
        })}
      />
    </div>
  );
};
