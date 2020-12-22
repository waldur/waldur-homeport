import { FunctionComponent, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { getEChartOptions } from '@waldur/marketplace/resources/usage/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage } from './types';

interface ResourceUsageChartProps {
  offeringComponent: OfferingComponent;
  usages: ComponentUsage[];
  chartColor: string;
}

export const ResourceUsageChart: FunctionComponent<ResourceUsageChartProps> = ({
  offeringComponent,
  usages,
  chartColor,
}) => {
  const options = useMemo(
    () => getEChartOptions(offeringComponent, usages, chartColor),
    [offeringComponent, usages, chartColor],
  );
  return <EChart options={options} height="400px" />;
};
