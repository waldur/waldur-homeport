import { EChartsOption, MarkLineComponentOption, SeriesOption } from 'echarts';

import { translate } from '@waldur/i18n';

import { CHART_BAR_ROUNDING, LINE_CHART_COLOR } from './constants';
import { Chart, ChartData } from './types';

type Value = string | number;
interface HLine {
  label: string;
  value: number;
}

const generateMarkLines = (
  hLines: HLine[],
  values?: Value[],
): MarkLineComponentOption =>
  !hLines?.length
    ? undefined
    : {
        data: hLines.map((line) => [
          {
            label: {
              show: false,
              position:
                values && line.value > Math.max(...values.map((v) => Number(v)))
                  ? 'insideMiddleBottom'
                  : 'insideMiddleTop',
              formatter: line.label,
            },
            emphasis: { label: { show: true } },
            lineStyle: { type: 'solid', color: '#0072ff' },
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
      };

export const getScopeChartOptions = (
  dates: string[],
  values: Value[],
  hLines?: HLine[],
  color?: string,
): EChartsOption => ({
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
      markLine: generateMarkLines(hLines, values),
    },
  ],
});

export const getLineChartOptions = (chart: Chart, hLines?: HLine[]) =>
  getScopeChartOptions(
    chart.data.map((item) => item.label),
    chart.data.map((item) => item.value),
    hLines,
    LINE_CHART_COLOR,
  );

export const getCostWidgetChartOptions = (
  series: SeriesOption[],
  hLines?: HLine[],
  xAxisValues?: string[],
) => {
  const options = {
    grid: {
      left: '0%',
      right: '0%',
      top: series.length > 2 ? 48 : 30,
      bottom: '0%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
      formatter: function (params) {
        if (!params.length) return '';

        const xLabel = params[0].axisValueLabel;
        params = params.filter((param) => param.value !== undefined);

        let tooltipText = `${xLabel}<br/>`;
        params.forEach((param) => {
          tooltipText += `
            <div class="d-flex justify-content-between gap-6">
              <span>${param.marker} ${param.seriesName}</span>
              <strong class="text-end">${param.value}</strong>
            </div>
          `;
        });

        return tooltipText;
      },
    },
    xAxis: [
      {
        type: 'category',
        axisPointer: {
          type: 'shadow',
        },
        axisTick: {
          show: false,
        },
        data: xAxisValues,
      },
    ],
    yAxis: [
      {
        type: 'value',
        splitNumber: 4,
      },
    ],
    legend: {
      data: series.map((serie) => serie.name),
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
        color: '#555',
      },
      itemGap: 8,
      left: '0%',
      align: 'left',
    },
    series: series.map((serie) => ({
      barCategoryGap: 6,
      barGap: '8%',
      ...serie,
    })),
  };

  const _series = options.series;
  for (let i = 0; i < _series.length; ++i) {
    const data = _series[i].data as ChartData;

    for (let j = 0; j < data.length; ++j) {
      const datum = data[j];
      if (datum) {
        const isPositive = Number(datum.value) >= 0;
        const topBorder = isPositive ? CHART_BAR_ROUNDING : 0;
        const bottomBorder = isPositive ? 0 : CHART_BAR_ROUNDING;

        data[j] = {
          ...datum,
          value: datum.value,
          itemStyle: {
            borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder],
          },
        };
      }
    }
  }

  // Add mark lines
  if (hLines) {
    _series[0].markLine = generateMarkLines(hLines);
  }

  return options;
};

function roundToNiceNumber(value, roundUp = true) {
  const absValue = Math.abs(value);

  let base = Math.pow(10, Math.floor(Math.log10(absValue)));

  if (absValue / base < 2) {
    base /= 2;
  } else if (absValue / base < 5) {
    base /= 1;
  }

  const result = roundUp
    ? Math.ceil(value / base) * base
    : Math.floor(value / base) * base;
  if (!result) return 0;
  else if (absValue < 10 && absValue > 1) {
    return roundUp ? result + 1 : result - 1;
  } else if (absValue < 1) {
    return roundUp ? 1 : -1;
  }
  return result;
}

function calculateYNameGap(value: number) {
  const digitCount = Math.abs(value).toString().length;
  const digitWidth = 7.72;
  const padding = 15;
  return digitCount * digitWidth + padding;
}

export const getCreditWidgetChartOptions = (
  series: SeriesOption[],
  xAxisValues?: string[],
) => {
  const allData = series
    .flatMap((serie) => serie.data)
    .flatMap((datum: any) => datum.value);

  const minValue = roundToNiceNumber(Math.min(...allData), false);
  const maxValue = roundToNiceNumber(Math.max(...allData));

  const nameGap = calculateYNameGap(maxValue);

  const options = {
    grid: {
      left: 35,
      right: '0%',
      top: 30,
      bottom: '0%',
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999',
        },
      },
    },
    xAxis: [
      {
        type: 'category',
        axisPointer: {
          type: 'shadow',
        },
        axisTick: {
          show: false,
        },
        data: xAxisValues,
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: translate('Credit used'),
        splitNumber: 4,
        position: 'left',
        nameLocation: 'middle',
        nameRotate: 90,
        nameGap,
        min: minValue,
        max: maxValue,
      },
      // {
      //   type: 'value',
      //   name: translate('Remaining'),
      //   splitNumber: 4,
      //   position: 'right',
      //   nameLocation: 'middle',
      //   nameRotate: -90,
      //   nameGap,
      //   min: minValue,
      //   max: maxValue,
      // },
    ],
    legend: {
      data: series.map((serie) => serie.name),
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
        color: '#555',
      },
      itemGap: 8,
      left: '0%',
      align: 'left',
    },
    series: series.map((serie) => ({
      barCategoryGap: 6,
      barGap: '8%',
      ...serie,
    })),
  };

  const _series = options.series;
  for (let i = 0; i < _series.length; ++i) {
    const data = _series[i].data as ChartData;

    for (let j = 0; j < data.length; ++j) {
      const datum = data[j];
      if (datum) {
        const isPositive = Number(datum.value) >= 0;
        const topBorder = isPositive ? CHART_BAR_ROUNDING : 0;
        const bottomBorder = isPositive ? 0 : CHART_BAR_ROUNDING;

        data[j] = {
          ...datum,
          value: datum.value,
          itemStyle: {
            borderRadius: [topBorder, topBorder, bottomBorder, bottomBorder],
          },
        };
      }
    }
  }

  return options;
};
