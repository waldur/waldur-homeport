import { FC, useMemo } from 'react';

import { translate } from '@waldur/i18n';
import { formatOrganizationType } from '@waldur/user/support/aai-constants';

import { UserOrganizationTypeCount } from '../types';

import { DonutChart } from './DonutChart';

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
      data.map((item) => ({
        name:
          formatOrganizationType(item.organization_type) ||
          translate('Not specified'),
        value: item.count,
      })),
    [data],
  );

  return (
    <DonutChart
      title={translate('Users by organization type')}
      data={chartData}
    />
  );
};
