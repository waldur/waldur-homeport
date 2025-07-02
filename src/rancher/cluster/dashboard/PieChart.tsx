import { EChartsOption, PieSeriesOption } from 'echarts';
import { useMemo, FC } from 'react';

import { EChart } from '@waldur/core/EChart';

interface PieChartProps {
  width?: string;
  height?: string;
  data: PieSeriesOption['data'];
}

export const PieChart: FC<PieChartProps> = ({
  width = '64px',
  height = '64px',
  data,
}) => {
  const options = useMemo<EChartsOption>(
    () => ({
      series: [
        {
          type: 'pie',
          radius: ['50%', '100%'],
          label: { show: false },
          animation: false,
          emphasis: { scaleSize: 0 },
          data,
        },
      ],
    }),
    [data],
  );
  return <EChart options={options} height={height} width={width} />;
};
