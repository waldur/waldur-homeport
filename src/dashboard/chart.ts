import { translate } from '@waldur/i18n';

type Value = string | number;
interface HLine {
  label: string;
  value: number;
}

export const getScopeChartOptions = (
  dates: string[],
  values: Value[],
  hLines?: HLine[],
  color?: string,
) => ({
  tooltip: {
    trigger: 'axis',
    formatter: '{b}',
  },
  grid: {
    left: 10,
    top: 10,
    right: 10,
    bottom: 10,
    containLabel: false,
  },
  xAxis: {
    data: dates,
    show: false,
  },
  yAxis: {
    show: false,
  },
  series: [
    {
      type: 'line',
      data: values,
      color,
      markLine: !hLines?.length
        ? undefined
        : {
            data: hLines.map((line) => [
              {
                label: {
                  normal: {
                    show: false,
                    position: 'middle',
                    formatter: line.label,
                  },
                  emphasis: { show: true },
                },
                lineStyle: { normal: { type: 'solid', color: '#0072ff' } },
                yAxis: line.value,
                x: '0%',
                symbol: 'none',
              },
              {
                yAxis: line.value,
                x: '100%',
                symbol: 'none',
              },
            ]),
          },
    },
  ],
});

export const getResourceChartOptions = (
  dates,
  usages,
  limits,
  units: string,
) => {
  const series = limits
    ? [
        {
          name: translate('Usage'),
          type: 'line',
          stack: 'Quota',
          data: usages,
        },
        {
          name: translate('Limit'),
          type: 'line',
          stack: 'Quota',
          data: limits,
        },
      ]
    : [
        {
          type: 'bar',
          data: usages,
          barMinHeight: 5,
        },
      ];
  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: 30,
      right: 50,
      bottom: 50,
      top: 50,
    },
    xAxis: [
      {
        type: 'category',
        data: dates,
        name: translate('Date'),
      },
    ],
    yAxis: [
      {
        name: units,
        type: 'value',
        minInterval: 1,
      },
    ],
    series,
  };
};
