import { useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { getEChartOptions } from '@waldur/marketplace/resources/usage/utils';

interface ResourceUsageChartProps {
  offeringComponent;
  usages;
  chartColor: string;
}

export const ResourceUsageChart = ({
  offeringComponent,
  usages,
  chartColor,
}: ResourceUsageChartProps) => {
  const options = useMemo(
    () => getEChartOptions(offeringComponent, usages, chartColor),
    [offeringComponent, usages, chartColor],
  );
  return <EChart options={options} height="400px" />;
};
