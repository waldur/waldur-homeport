import { DateTime } from 'luxon';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { generateColors } from '@waldur/customer/divisions/utils';
import { translate } from '@waldur/i18n';
import { getProviderOffering } from '@waldur/marketplace/common/api';
import { getProviderOfferingComponentStats } from '@waldur/marketplace/offerings/expandable/api';
import { ResourceUsageTabs } from '@waldur/marketplace/resources/usage/ResourceUsageTabs';
import { OfferingComponent } from '@waldur/marketplace/types';
import { SLURM_PLUGIN } from '@waldur/slurm/constants';
import { parseSlurmUsage } from '@waldur/slurm/details/utils';

interface OfferingUsageChartProps {
  offeringUuid: string;
  components: OfferingComponent[];
}

export const OfferingUsageChart: FunctionComponent<OfferingUsageChartProps> = ({
  offeringUuid,
  components,
}) => {
  const {
    loading,
    error,
    value: usages,
  } = useAsync(async () => {
    const offering = await getProviderOffering(offeringUuid);
    const usages = await getProviderOfferingComponentStats(offeringUuid, {
      params: {
        start: DateTime.now()
          .minus({ months: 12 })
          .startOf('month')
          .toFormat('yyyy-MM'),
        end: DateTime.now().endOf('month').toFormat('yyyy-MM'),
      },
    });
    if (offering.type === SLURM_PLUGIN) {
      return usages.map(parseSlurmUsage);
    }
    return usages;
  }, [offeringUuid]);
  return loading ? (
    <LoadingSpinner />
  ) : error ? (
    <>{translate('Unable to load data')}</>
  ) : (
    <div
      className="card-body mt-3 p-m"
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
