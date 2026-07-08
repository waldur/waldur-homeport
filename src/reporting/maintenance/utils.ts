import { escape } from 'lodash-es';
import { DateTime } from 'luxon';
import { MaintenanceAnnouncement } from 'waldur-js-client';

import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

import {
  MaintenanceTimelineItem,
  TimelineColoring,
  TimingBucket,
} from './types';

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

// Timing bucket colors — matches the documented palette in the plan
const TIMING_COLORS: Record<TimingBucket, string> = {
  on_time: '#50cd89',
  late_start: '#ffa800',
  overrun: '#f1416c',
  early: '#009ef7',
  pending: '#7e8299',
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

export const TIMING_LABELS: Record<TimingBucket, string> = {
  on_time: translate('On time'),
  late_start: translate('Late start'),
  overrun: translate('Overrun'),
  early: translate('Finished early'),
  pending: translate('Pending'),
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
 * Format a duration in minutes as a localised, sign-prefixed string.
 * Examples: `+12 min`, `+1 h 5 min`, `-8 min`, or DASH when null.
 */
function formatSignedDuration(deltaMinutes: number): string {
  const sign = deltaMinutes >= 0 ? '+' : '-';
  const absMinutes = Math.abs(deltaMinutes);
  if (absMinutes < 60) {
    return `${sign}${absMinutes} ${translate('min')}`;
  }
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  if (minutes === 0) {
    return `${sign}${hours} ${translate('h')}`;
  }
  return `${sign}${hours} ${translate('h')} ${minutes} ${translate('min')}`;
}

/**
 * Format the backend-computed overrun (actual_end - scheduled_end, in minutes)
 * for table/UI rendering. Returns text and a Bootstrap text-* className.
 */
export function formatDelta(overrunMinutes: number | null | undefined): {
  text: string;
  className: string;
} {
  if (overrunMinutes === null || overrunMinutes === undefined) {
    return { text: DASH_ESCAPE_CODE, className: 'text-muted' };
  }
  if (overrunMinutes > 0) {
    return {
      text: formatSignedDuration(overrunMinutes),
      className: 'text-danger',
    };
  }
  if (overrunMinutes < 0) {
    return {
      text: formatSignedDuration(overrunMinutes),
      className: 'text-success',
    };
  }
  return { text: formatSignedDuration(0), className: 'text-muted' };
}

/**
 * Transform announcements to timeline items
 */
export function toTimelineItems(
  announcements: MaintenanceAnnouncement[],
): MaintenanceTimelineItem[] {
  return announcements.map((a) => {
    const actualStart = a.actual_start ? new Date(a.actual_start) : null;
    const actualEnd = a.actual_end ? new Date(a.actual_end) : null;
    return {
      id: a.uuid,
      name: a.name,
      state: a.state,
      scheduledStart: new Date(a.scheduled_start),
      scheduledEnd: new Date(a.scheduled_end),
      actualStart,
      actualEnd,
      providerName: a.service_provider_name,
      providerUuid: a.service_provider,
      offeringNames: a.affected_offerings.map((o) => o.offering_name),
      maxImpactLevel: getMaxImpactLevel(a),
      // Timing metrics come from the backend (WAL-9986), not client computation.
      startDeltaMinutes: a.start_delta_minutes,
      endDeltaMinutes: a.overrun_minutes,
      timingBucket: a.timing_bucket,
    };
  });
}

/**
 * Format timeline chart options for EChart
 */
export function formatTimelineChart(
  items: MaintenanceTimelineItem[],
  groupBy: 'provider' | 'offering',
  colorBy: TimelineColoring,
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

  // Calculate time range — include actuals so the axis is wide enough to show them.
  const allDates = items.flatMap((i) => {
    const stamps = [i.scheduledStart.getTime(), i.scheduledEnd.getTime()];
    if (i.actualStart) stamps.push(i.actualStart.getTime());
    if (i.actualEnd) stamps.push(i.actualEnd.getTime());
    return stamps;
  });
  const minTime = Math.min(...allDates);
  const maxTime = Math.max(...allDates);

  const isTiming = colorBy === 'timing';

  // Create data items
  const data: any[] = [];

  for (const item of items) {
    const categoryKeys =
      groupBy === 'provider' ? [item.providerName] : item.offeringNames;

    for (const categoryKey of categoryKeys) {
      const categoryIndex = categoryMap.get(categoryKey)!;

      if (isTiming) {
        const timingColor = TIMING_COLORS[item.timingBucket];
        // Scheduled bar — outline, upper half of the band.
        data.push({
          value: [
            categoryIndex,
            item.scheduledStart.getTime(),
            item.scheduledEnd.getTime(),
            item.name,
          ],
          itemStyle: {
            color: timingColor,
            opacity: 0.4,
            borderColor: timingColor,
            borderWidth: 1,
          },
          name: item.name,
          item,
          kind: 'scheduled',
        });
        // Actual bar — solid, lower half of the band; only when actuals exist.
        if (item.actualStart && item.actualEnd) {
          data.push({
            value: [
              categoryIndex,
              item.actualStart.getTime(),
              item.actualEnd.getTime(),
              item.name,
            ],
            itemStyle: { color: timingColor },
            name: item.name,
            item,
            kind: 'actual',
          });
        }
      } else {
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
          kind: 'scheduled',
        });
      }
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
        const actualStart = item.actualStart
          ? DateTime.fromJSDate(item.actualStart).toFormat('yyyy-MM-dd HH:mm')
          : DASH_ESCAPE_CODE;
        const actualEnd = item.actualEnd
          ? DateTime.fromJSDate(item.actualEnd).toFormat('yyyy-MM-dd HH:mm')
          : DASH_ESCAPE_CODE;
        const startDelta =
          item.startDeltaMinutes !== null
            ? formatSignedDuration(item.startDeltaMinutes)
            : DASH_ESCAPE_CODE;
        const endDelta =
          item.endDeltaMinutes !== null
            ? formatSignedDuration(item.endDeltaMinutes)
            : DASH_ESCAPE_CODE;

        // Escape operator-supplied fields (maintenance name, provider name,
        // state) before interpolating them into the HTML tooltip — ECharts
        // injects the formatter result via innerHTML, so unescaped values
        // would allow XSS from a malicious service provider.
        const safeName = escape(item.name);
        const safeProvider = escape(item.providerName ?? '');
        const safeState = escape(STATE_LABELS[item.state] || item.state);

        let html = `<strong>${safeName}</strong><br/>`;
        html += `${translate('State')}: ${safeState}<br/>`;
        html += `${translate('Provider')}: ${safeProvider}<br/>`;
        html += `${translate('Scheduled')}: ${schedStart} - ${schedEnd}<br/>`;
        html += `${translate('Actual')}: ${actualStart} - ${actualEnd}<br/>`;
        html += `${translate('Δ start')}: ${startDelta}<br/>`;
        html += `${translate('Δ end')}: ${endDelta}<br/>`;
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
          const bandHeight = api.size([0, 1])[1];

          if (isTiming) {
            const halfHeight = bandHeight * 0.35;
            // Datum.kind is read from the data array via api.value/api.style; ECharts
            // exposes it via params.data in renderItem too, but we keep it simple:
            // we derive y-offset purely from the datum's `kind` tag in style metadata.
            const kind = (_params.data && (_params.data as any).kind) as
              'scheduled' | 'actual' | undefined;
            // Scheduled goes in the upper half, actual in the lower half.
            const yOffset =
              kind === 'actual'
                ? halfHeight * 0.1
                : -halfHeight - halfHeight * 0.1;

            const rectShape = {
              x: start[0],
              y: start[1] + yOffset,
              width: Math.max(end[0] - start[0], 1),
              height: halfHeight,
            };

            return {
              type: 'rect',
              shape: rectShape,
              style: api.style(),
            };
          }

          const height = bandHeight * 0.6;

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
