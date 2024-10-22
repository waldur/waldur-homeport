import { translate } from '@waldur/i18n';

import { LINE_CHART_COLOR } from './constants';
import { Chart, RingChartOption } from './types';

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

export const getLineChartOptions = (chart: Chart, hLines?: HLine[]) =>
  getScopeChartOptions(
    chart.data.map((item) => item.label),
    chart.data.map((item) => item.value),
    hLines,
    LINE_CHART_COLOR,
  );

export const getRingChartOptions = (props: RingChartOption) => {
  const emptySpace = (props.max || 100) - props.value;
  return {
    title: {
      text: props.title,
      left: 'center',
      top: '26%',
      textStyle: {
        color: '#344054',
        fontSize: 15,
        fontWeight: '500',
      },
    },
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    },
    color: ['#307300', '#e6f0e3'],
    series: [
      {
        type: 'pie',
        startAngle: '90',
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          padding: [30, 0, 0, 0],
          textStyle: {
            color: '#0c111d',
            fontSize: 16,
            fontWeight: '600',
          },
        },
        labelLine: {
          show: false,
        },
        emphasis: {
          label: {
            fontSize: 17,
          },
        },
        hoverOffset: 2,
        data: [
          {
            value: props.value,
            name: props.label,
          },
          {
            value: emptySpace,
            itemStyle: {
              color: '#e6f0e3',
            },
            emphasis: {
              itemStyle: {
                color: '#e6f0e3',
              },
            },
          },
        ],
        radius: ['83%', '98%'],
      },
    ],
  };
};
