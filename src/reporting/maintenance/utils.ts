import { DateTime } from 'luxon';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { MaintenanceTimelineItem } from './types';

// State colors matching the existing getMaintenanceState pattern
const STATE_COLORS: Record<string, string> = {
  Draft: '#7e8299',
  Scheduled: '#ffc700',
  'In progress': '#009ef7',
  Completed: '#50cd89',
  Cancelled: '#f1416c',
};

// Impact level colors (1=No impact, 2=Degraded, 3=Partial outage, 4=Full outage)
const IMPACT_COLORS: Record<number, string> = {
  1: '#50cd89', // No impact - Green
  2: '#ffc700', // Degraded - Yellow
  3: '#ffa800', // Partial outage - Orange
  4: '#f1416c', // Full outage - Red
};

export const IMPACT_LABELS: Record<number, string> = {
  1: translate('No impact'),
  2: translate('Degraded performance'),
  3: translate('Partial outage'),
  4: translate('Full outage'),
};

export const MAINTENANCE_TYPE_LABELS: Record<number, string> = {
  1: translate('Scheduled'),
  2: translate('Emergency'),
  3: translate('Security'),
  4: translate('System upgrade'),
  5: translate('Patch deployment'),
};

export const STATE_LABELS: Record<string, string> = {
  Draft: translate('Draft'),
  Scheduled: translate('Scheduled'),
  'In progress': translate('In progress'),
  Completed: translate('Completed'),
  Cancelled: translate('Cancelled'),
};

/**
 * Get the maximum impact level from affected offerings
 */
export function getMaxImpactLevel(
  announcement: MaintenanceAnnouncement,
): number {
  if (!announcement.affected_offerings?.length) {
    return 1;
  }
  return Math.max(
    ...announcement.affected_offerings.map((o) => o.impact_level || 1),
  );
}

/**
 * Transform announcements to timeline items
 */
export function toTimelineItems(
  announcements: MaintenanceAnnouncement[],
): MaintenanceTimelineItem[] {
  return announcements.map((a) => ({
    id: a.uuid,
    name: a.name,
    state: a.state,
    scheduledStart: new Date(a.scheduled_start),
    scheduledEnd: new Date(a.scheduled_end),
    actualStart: a.actual_start ? new Date(a.actual_start) : null,
    actualEnd: a.actual_end ? new Date(a.actual_end) : null,
    providerName: a.service_provider_name,
    providerUuid: a.service_provider,
    offeringNames: a.affected_offerings.map((o) => o.offering_name),
    maxImpactLevel: getMaxImpactLevel(a),
  }));
}

/**
 * Format timeline chart options for EChart
 */
export function formatTimelineChart(
  items: MaintenanceTimelineItem[],
  groupBy: 'provider' | 'offering',
  colorBy: 'state' | 'impact',
): object {
  if (items.length === 0) {
    return {};
  }

  // Group items
  const categories: string[] = [];
  const categoryMap = new Map<string, number>();

  if (groupBy === 'provider') {
    const providers = [...new Set(items.map((i) => i.providerName))];
    providers.forEach((p, idx) => {
      categories.push(p);
      categoryMap.set(p, idx);
    });
  } else {
    const offerings = [...new Set(items.flatMap((i) => i.offeringNames))];
    offerings.forEach((o, idx) => {
      categories.push(o);
      categoryMap.set(o, idx);
    });
  }

  // Calculate time range
  const allDates = items.flatMap((i) => [
    i.scheduledStart.getTime(),
    i.scheduledEnd.getTime(),
  ]);
  const minTime = Math.min(...allDates);
  const maxTime = Math.max(...allDates);

  // Create data items
  const data: any[] = [];

  for (const item of items) {
    const categoryKeys =
      groupBy === 'provider' ? [item.providerName] : item.offeringNames;

    for (const categoryKey of categoryKeys) {
      const categoryIndex = categoryMap.get(categoryKey)!;
      const color =
        colorBy === 'state'
          ? STATE_COLORS[item.state] || '#7e8299'
          : IMPACT_COLORS[item.maxImpactLevel] || '#7e8299';

      // Scheduled period (bar)
      data.push({
        value: [
          categoryIndex,
          item.scheduledStart.getTime(),
          item.scheduledEnd.getTime(),
          item.name,
        ],
        itemStyle: { color },
        name: item.name,
        item,
      });
    }
  }

  return {
    tooltip: {
      formatter: (params: any) => {
        const item = params.data?.item as MaintenanceTimelineItem;
        if (!item) return '';

        const schedStart = DateTime.fromJSDate(item.scheduledStart).toFormat(
          'yyyy-MM-dd HH:mm',
        );
        const schedEnd = DateTime.fromJSDate(item.scheduledEnd).toFormat(
          'yyyy-MM-dd HH:mm',
        );

        let html = `<strong>${item.name}</strong><br/>`;
        html += `${translate('State')}: ${STATE_LABELS[item.state] || item.state}<br/>`;
        html += `${translate('Provider')}: ${item.providerName}<br/>`;
        html += `${translate('Scheduled')}: ${schedStart} - ${schedEnd}<br/>`;
        html += `${translate('Impact')}: ${IMPACT_LABELS[item.maxImpactLevel] || DASH_ESCAPE_CODE}`;

        return html;
      },
    },
    grid: {
      left: 150,
      right: 30,
      top: 30,
      bottom: 60,
    },
    xAxis: {
      type: 'time',
      min: minTime - 24 * 60 * 60 * 1000, // 1 day padding
      max: maxTime + 24 * 60 * 60 * 1000,
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        width: 140,
        overflow: 'truncate',
      },
    },
    dataZoom: [
      {
        type: 'slider',
        xAxisIndex: 0,
        filterMode: 'weakFilter',
        height: 20,
        bottom: 10,
        handleIcon: 'path://M10,0L20,20H0Z',
        handleSize: '100%',
      },
    ],
    series: [
      {
        type: 'custom',
        renderItem: (_params: any, api: any) => {
          const categoryIndex = api.value(0);
          const start = api.coord([api.value(1), categoryIndex]);
          const end = api.coord([api.value(2), categoryIndex]);
          const height = api.size([0, 1])[1] * 0.6;

          const rectShape = {
            x: start[0],
            y: start[1] - height / 2,
            width: end[0] - start[0],
            height: height,
          };

          return {
            type: 'rect',
            shape: rectShape,
            style: api.style(),
          };
        },
        encode: {
          x: [1, 2],
          y: 0,
        },
        data,
      },
    ],
  };
}
