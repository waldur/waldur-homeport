import { DateTime } from 'luxon';
import { FC, useMemo } from 'react';
import { Card } from 'react-bootstrap';

import { EChart } from '@waldur/core/EChart';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { renderFieldOrDash } from '@waldur/table/utils';

import { LimitHistoryPoint, ComponentLabelMap } from './types';

interface ResourceLimitsHistoryChartProps {
  data: LimitHistoryPoint[];
  componentType?: string;
  /** Map of component type to display label from offering */
  labelMap?: ComponentLabelMap;
  isLoading?: boolean;
}

const CHART_COLORS: Record<string, string> = {
  cpu_k_hours: '#009ef7',
  gpu_hours: '#50cd89',
  gb_k_hours: '#ffc700',
};

// Helper to get label from map or format type as fallback
const getTypeLabel = (type: string, labelMap?: ComponentLabelMap): string => {
  if (labelMap?.[type]) return labelMap[type];
  // Fallback: convert snake_case to Title Case
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ResourceLimitsHistoryChart: FC<
  ResourceLimitsHistoryChartProps
> = ({ data, componentType, labelMap, isLoading }) => {
  const chartOptions = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Group data by limit type
    const seriesByType: Record<
      string,
      Array<{ date: string; value: number }>
    > = {};

    for (const point of data) {
      if (!seriesByType[point.limit_name]) {
        seriesByType[point.limit_name] = [];
      }
      seriesByType[point.limit_name].push({
        date: point.date,
        value: point.limit_value,
      });
    }

    // Create series for each type
    const series = Object.entries(seriesByType).map(([type, points]) => {
      // For step chart, we need to add intermediate points
      const expandedPoints: Array<{ date: string; value: number }> = [];
      for (let i = 0; i < points.length; i++) {
        const point = points[i];
        // Add this point
        expandedPoints.push(point);
        // If there's a next point, add an intermediate step
        if (i < points.length - 1) {
          const nextPoint = points[i + 1];
          // Add a point just before the next change with the current value
          expandedPoints.push({
            date: DateTime.fromISO(nextPoint.date)
              .minus({ seconds: 1 })
              .toISO(),
            value: point.value,
          });
        }
      }

      return {
        name: getTypeLabel(type, labelMap),
        type: 'line',
        step: 'end',
        data: expandedPoints.map((p) => [p.date, p.value]),
        itemStyle: { color: CHART_COLORS[type] || '#7e8299' },
        lineStyle: { width: 2 },
        showSymbol: true,
        symbolSize: 6,
      };
    });

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
            'dd MMM yyyy HH:mm',
          );
          let result = `<strong>${date}</strong><br/>`;
          for (const param of params) {
            result += `${param.marker} ${param.seriesName}: ${renderFieldOrDash(param.value[1]?.toLocaleString())}<br/>`;
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
        name: translate('Limit value'),
        axisLabel: {
          formatter: (value: number) => value.toLocaleString(),
        },
      },
      series,
    };
  }, [data, labelMap]);

  const hasData = data && data.length > 0;
  const title = componentType
    ? translate('Limits history: {type}', {
        type: getTypeLabel(componentType, labelMap),
      })
    : translate('Resource limits history');

  return (
    <Card className="h-100">
      <Card.Header>
        <Card.Title>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <LoadingSpinner className="py-10" />
        ) : hasData && chartOptions ? (
          <EChart options={chartOptions} height="350px" />
        ) : (
          <NoResult
            title={translate('No data available')}
            message={translate(
              'No limit changes recorded. Limits are captured when orders are processed.',
            )}
          />
        )}
      </Card.Body>
    </Card>
  );
};
