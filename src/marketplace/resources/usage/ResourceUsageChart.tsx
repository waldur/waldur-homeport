import { FunctionComponent, useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';
import { getEChartOptions } from '@waldur/marketplace/resources/usage/utils';
import { OfferingComponent } from '@waldur/marketplace/types';

import { ComponentUsage, ComponentUserUsage } from './types';

interface ResourceUsageChartProps {
  offeringComponent: OfferingComponent;
  usages: ComponentUsage[];
  userUsages?: ComponentUserUsage[];
  months: number;
  chartColor: string;
}

export const ResourceUsageChart: FunctionComponent<ResourceUsageChartProps> = ({
  offeringComponent,
  usages,
  userUsages,
  months,
  chartColor,
}) => {
  const options = useMemo(
    () =>
      getEChartOptions(
        offeringComponent,
        usages,
        userUsages,
        months,
        chartColor,
      ),
    [offeringComponent, usages, userUsages, chartColor],
  );
  return <EChart options={options} height="400px" />;
};
