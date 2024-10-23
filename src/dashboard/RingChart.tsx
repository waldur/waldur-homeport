import { FC, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { EChart } from '@waldur/core/EChart';
import { themeSelector } from '@waldur/navigation/theme/store';

import { getRingChartOptions } from './chart';
import { RingChartOption } from './types';

interface RingChartProps {
  option: RingChartOption;
  height?: string;
  width?: string;
  className?: string;
}

export const RingChart: FC<RingChartProps> = ({
  option,
  height = '150px',
  width = '150px',
  className,
}) => {
  const theme = useSelector(themeSelector);
  const options = useMemo(
    () => getRingChartOptions(option, theme),
    [option, theme],
  );
  return (
    <EChart
      options={options}
      height={height}
      width={width}
      className={className}
    />
  );
};
