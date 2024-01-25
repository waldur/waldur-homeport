import { FunctionComponent, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { getEChartOptions } from '@waldur/marketplace/resources/usage/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage } from './types';

interface ResourceUsageChartProps {
  offeringComponent: OfferingComponent;
  usages: ComponentUsage[];
  months: number;
  chartColor: string;
}

export const ResourceUsageChart: FunctionComponent<ResourceUsageChartProps> = ({
  offeringComponent,
  usages,
  months,
  chartColor,
}) => {
  const options = useMemo(
    () => getEChartOptions(offeringComponent, usages, months, chartColor),
    [offeringComponent, usages, chartColor],
  );
  return <EChart options={options} height="400px" />;
};
