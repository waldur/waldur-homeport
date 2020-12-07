import React from 'react';

import { EChart } from '@waldur/core/EChart';
import { getEChartOptions } from '@waldur/marketplace/resources/usage/utils';

export const ResourceUsageChart = ({
  offeringComponent,
  usages,
  colors,
  tabIndex,
}) => {
  const options = React.useMemo(
    () => getEChartOptions(offeringComponent, usages, colors, tabIndex),
    [offeringComponent, usages, colors, tabIndex],
  );
  return <EChart options={options} height="400px" />;
};
