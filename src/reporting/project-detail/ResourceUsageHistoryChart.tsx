import { DateTime } from 'luxon';
import { FC, useMemo, useCallback } from 'react';

import { ChartCard } from '@/core/ChartCard';
import { EChart } from '@/core/EChart';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ExportData } from '@/table/exporters/types';
import { renderFieldOrDash } from '@/table/utils';

import { UsageHistoryPoint, ComponentLabelMap } from './types';

interface ResourceUsageHistoryChartProps {
  data: UsageHistoryPoint[];
  componentType?: string;
  /** Map of component type to display label from offering */
  labelMap?: ComponentLabelMap;
  isLoading?: boolean;
}

// Helper to get label from map or format type as fallback
const getTypeLabel = (type: string, labelMap?: ComponentLabelMap): string => {
  if (labelMap?.[type]) return labelMap[type];
  // Fallback: convert snake_case to Title Case
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const CHART_COLORS: Record<string, string> = {
  cpu_k_hours: '#009ef7',
  gpu_hours: '#50cd89',
  gb_k_hours: '#ffc700',
};

export const ResourceUsageHistoryChart: FC<ResourceUsageHistoryChartProps> = ({
  data,
  componentType,
  labelMap,
  isLoading,
}) => {
  const chartOptions = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Group data by type
    const seriesByType: Record<
      string,
      Array<{ date: string; usage: number; cumulative: number }>
    > = {};

    for (const point of data) {
      if (!seriesByType[point.type]) {
        seriesByType[point.type] = [];
      }
      seriesByType[point.type].push({
        date: point.date,
        usage: point.usage,
        cumulative: point.cumulative_usage,
      });
    }

    // Create series for cumulative usage
    const series = Object.entries(seriesByType).map(([type, points]) => ({
      name: getTypeLabel(type, labelMap),
      type: 'line',
      data: points.map((p) => [p.date, p.cumulative]),
      itemStyle: { color: CHART_COLORS[type] || '#7e8299' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: (CHART_COLORS[type] || '#7e8299') + '40' },
            { offset: 1, color: (CHART_COLORS[type] || '#7e8299') + '05' },
          ],
        },
      },
      lineStyle: { width: 2 },
      smooth: true,
      showSymbol: true,
      symbolSize: 4,
    }));

    // Get legend data
    const legendData = Object.keys(seriesByType).map((type) =>
      getTypeLabel(type, labelMap),
    );

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params) => {
          if (!params || params.length === 0) return '';
          const date = DateTime.fromISO(params[0].value[0]).toFormat(
            'MMM yyyy',
          );
          let result = `<strong>${date}</strong><br/>`;
          for (const param of params) {
            const cumulative = renderFieldOrDash(
              param.value[1]?.toLocaleString(),
            );
            // Find the monthly usage for this point
            const type = Object.keys(seriesByType).find(
              (t) => getTypeLabel(t, labelMap) === param.seriesName,
            );
            const point = type
              ? seriesByType[type].find((p) => p.date === params[0].value[0])
              : null;
            const monthly = renderFieldOrDash(point?.usage?.toLocaleString());

            result += `${param.marker} ${param.seriesName}<br/>`;
            result += `&nbsp;&nbsp;${translate('Monthly')}: ${monthly}<br/>`;
            result += `&nbsp;&nbsp;${translate('Cumulative')}: ${cumulative}<br/>`;
          }
          return result;
        },
      },
      legend: {
        data: legendData,
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'time',
        axisLabel: {
          formatter: (value: string) =>
            DateTime.fromMillis(Number(value)).toFormat('MMM yyyy'),
        },
      },
      yAxis: {
        type: 'value',
        name: translate('Cumulative usage'),
        axisLabel: {
          formatter: (value: number) => value.toLocaleString(),
        },
      },
      series,
    };
  }, [data, labelMap]);

  const getExportData = useCallback((): ExportData => {
    if (!data || data.length === 0) {
      return { fields: [], data: [] };
    }
    const fields = [
      translate('Date'),
      translate('Type'),
      translate('Monthly usage'),
      translate('Cumulative usage'),
    ];
    const csvData = data.map((point) => [
      point.date,
      getTypeLabel(point.type, labelMap),
      point.usage,
      point.cumulative_usage,
    ]);
    return { fields, data: csvData };
  }, [data, labelMap]);

  const hasData = data && data.length > 0;
  const title = componentType
    ? translate('Usage since creation: {type}', {
        type: getTypeLabel(componentType, labelMap),
      })
    : translate('Resource usage since creation');

  return (
    <ChartCard
      title={title}
      getExportData={getExportData}
      isEmpty={!isLoading && !hasData}
    >
      {(ref) => (
        <>
          {isLoading ? (
            <LoadingSpinner className="py-10" />
          ) : hasData && chartOptions ? (
            <EChart ref={ref} options={chartOptions} height="350px" />
          ) : null}
        </>
      )}
    </ChartCard>
  );
};
