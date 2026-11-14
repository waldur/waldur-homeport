import { describe, expect, it } from 'vitest';

import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import {
  buildStorageBarOptions,
  buildStorageProjectBarOptions,
  buildStorageProjectTimeseriesOptions,
  buildStorageTimeseriesOptions,
} from './storageChartOptions';
import {
  allocationTooltip,
  buildAvgWaitTimeseriesOptions,
  buildJobsTimeseriesOptions,
  buildProjectAvgWaitTimeseriesOptions,
  buildProjectJobsTimeseriesOptions,
  buildProjectTimeseriesOptions,
  buildTimeseriesOptions,
  buildTooltipRows,
} from './usageChartOptions';

// Series, axis and row names come from user full names, project names and
// volume names. ECharts inserts a tooltip formatter's result as HTML.
const NAME = '<img src=x onerror=alert(1)>';
const ESCAPED = '&lt;img src=x onerror=alert(1)&gt;';

const expectEscaped = (html: string) => {
  expect(html).toContain(ESCAPED);
  expect(html).not.toContain('<img');
};

const axisParams = (value = 2) => [
  {
    axisValueLabel: NAME,
    name: NAME,
    seriesName: NAME,
    marker: '',
    color: 'currentColor',
    value,
  },
];

const tooltipOf = (options: any) => options.tooltip.formatter;

const usageReport = () =>
  new ProjectUsageReport(
    { project: 'p', users: {}, reports: {} } as any,
    { year: 2026, month: 1, resource: 'r', is_complete: true } as any,
  );

const storageReport = (json: Record<string, any> = {}) =>
  new ProjectStorageReport(
    {
      project: 'p',
      generated_at: '2026-01-01T00:00:00Z',
      project_quotas: {},
      user_quotas: {},
      users: {},
      daily_reports: {},
      ...json,
    } as any,
    { year: 2026, month: 1, resource: 'r' } as any,
  );

describe('OpenPortal chart tooltips escape names', () => {
  it('buildTooltipRows', () => {
    expectEscaped(buildTooltipRows(axisParams(), String).rows);
  });

  it('allocationTooltip', () => {
    expectEscaped(allocationTooltip(axisParams()));
    expectEscaped(allocationTooltip(axisParams(0)));
  });

  it.each([
    ['buildTimeseriesOptions', () => buildTimeseriesOptions(usageReport())],
    [
      'buildProjectTimeseriesOptions',
      () => buildProjectTimeseriesOptions([usageReport()]),
    ],
    [
      'buildJobsTimeseriesOptions',
      () => buildJobsTimeseriesOptions(usageReport()),
    ],
    [
      'buildProjectJobsTimeseriesOptions',
      () => buildProjectJobsTimeseriesOptions([usageReport()]),
    ],
    [
      'buildAvgWaitTimeseriesOptions',
      () => buildAvgWaitTimeseriesOptions(usageReport()),
    ],
    [
      'buildProjectAvgWaitTimeseriesOptions',
      () => buildProjectAvgWaitTimeseriesOptions([usageReport()]),
    ],
    [
      'buildStorageTimeseriesOptions',
      () => buildStorageTimeseriesOptions(storageReport()),
    ],
    [
      'buildStorageProjectBarOptions',
      () => buildStorageProjectBarOptions([storageReport()]),
    ],
    [
      'buildStorageProjectTimeseriesOptions',
      () => buildStorageProjectTimeseriesOptions([storageReport()]),
    ],
  ])('%s', (_, build) => {
    expectEscaped(tooltipOf(build())(axisParams()));
  });

  describe('buildStorageBarOptions', () => {
    const quota = { limit: '10.00 GB', usage: '1.00 GB' };

    it('escapes a user row: name, identifier and volume', () => {
      const report = storageReport({
        user_quotas: { [NAME]: { [NAME]: quota } },
        users: { [NAME]: NAME },
      });
      const html = tooltipOf(
        buildStorageBarOptions(report, 'all', true, { user: { [NAME]: NAME } }),
      )([{ axisValueLabel: NAME }]);

      expectEscaped(html);
      // Name, identifier and volume all appear, each escaped.
      expect(html.split(ESCAPED)).toHaveLength(4);
    });

    it('escapes a project volume row', () => {
      const report = storageReport({ project_quotas: { [NAME]: quota } });
      const options = buildStorageBarOptions(report);
      const projectRow = (options.yAxis as any).data.find((label: string) =>
        label.includes(NAME),
      );

      expectEscaped(tooltipOf(options)([{ axisValueLabel: projectRow }]));
    });

    it('escapes a project volume row it has no quota for', () => {
      const options = buildStorageBarOptions(
        storageReport({ project_quotas: { other: quota } }),
      );
      const projectRow = (options.yAxis as any).data[0].replace('other', NAME);

      expectEscaped(tooltipOf(options)([{ axisValueLabel: projectRow }]));
    });

    it('escapes a user row with no quotas', () => {
      const html = tooltipOf(buildStorageBarOptions(storageReport()))([
        { axisValueLabel: NAME },
      ]);

      expect(html).toBe(`<b>${ESCAPED}</b> <small>(${ESCAPED})</small>`);
    });
  });

  it('leaves plain names as they are', () => {
    const html = allocationTooltip([
      { axisValueLabel: '2026-01', seriesName: 'Alice', marker: '', value: 1 },
    ]);
    expect(html).toBe('2026-01<br/>Alice: <b>1.00</b>');
  });
});
