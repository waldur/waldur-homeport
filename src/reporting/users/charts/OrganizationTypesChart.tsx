import { FC, useCallback, useMemo } from 'react';
import { UserOrganizationTypeCount } from 'waldur-js-client';

import { ChartCard } from '@waldur/core/ChartCard';
import { translate } from '@waldur/i18n';
import { formatOrganizationType } from '@waldur/user/support/aai-constants';

import { DonutChart } from './DonutChart';
import { getChartExportData } from './utils';

interface OrganizationTypesChartProps {
  data: UserOrganizationTypeCount[];
}

/**
 * Chart displaying user distribution by organization type (SCHAC URN)
 */
export const OrganizationTypesChart: FC<OrganizationTypesChartProps> = ({
  data,
}) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name:
          formatOrganizationType(item.organization_type) ||
          translate('Not specified'),
        value: item.count,
      })),
    [data],
  );

  const getExportData = useCallback(
    () => getChartExportData(translate('Organization type'), chartData),
    [chartData],
  );

  return (
    <ChartCard
      title={translate('Organization types')}
      getExportData={getExportData}
      isEmpty={!data || data.length === 0}
    >
      {(ref) => <DonutChart ref={ref} data={chartData} />}
    </ChartCard>
  );
};
