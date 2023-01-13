import { useMemo } from 'react';

import { EChart } from '@waldur/core/EChart';

import { getRingChartOptions, RingChartOption } from './utils';

interface RingChartProps {
  option: RingChartOption;
}

export const RingChart = (props: RingChartProps) => {
  const options = useMemo(
    () => getRingChartOptions(props.option),
    [props.option],
  );
  return <EChart options={options} height="150px" />;
};
