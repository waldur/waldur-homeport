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
  buildAvgWaitPieOptions,
  buildAvgWaitTimeseriesOptions,
  buildJobsPieOptions,
  buildJobsTimeseriesOptions,
  buildPieOptions,
  buildProjectJobsPieOptions,
  buildProjectJobsTimeseriesOptions,
  buildProjectPieOptions,
  buildProjectTimeseriesOptions,
  buildTimeseriesOptions,
} from './usageChartOptions';

const USER_ID = 'alice.project-a.portal';
const LOCAL_USER = 'alice.project-a';

const usage = ProjectUsageReport.fromApiResponse({
  id: 1,
  year: 2026,
  month: 8,
  project_identifier: 'project-a.portal',
  resource: 'cluster-a',
  is_complete: true,
  report: {
    project: 'project-a.portal',
    users: { [USER_ID]: LOCAL_USER },
    reports: {
      '2026-08-01': {
        is_complete: true,
        reports: { [LOCAL_USER]: { seconds: 3600 } },
      },
      '2026-08-02': {
        is_complete: true,
        reports: { [LOCAL_USER]: { seconds: 7200 } },
      },
    },
  },
} as any);

const storage = ProjectStorageReport.fromApiResponse({
  id: 2,
  year: 2026,
  month: 8,
  project_identifier: 'project-a.portal',
  resource: 'cluster-a',
  report: {
    project: 'project-a.portal',
    generated_at: '2026-08-31T00:00:00Z',
    project_quotas: { home: { limit: '1024.00 GB', usage: '24.00 KB' } },
    user_quotas: {
      [USER_ID]: { home: { limit: 'unlimited', usage: '1.00 GB' } },
    },
    users: { [USER_ID]: LOCAL_USER },
  },
} as any);

// ECharts draws a tooltip next to the pointer; without `confine` a chart near
// the edge of a narrow viewport puts part of the tooltip off-screen.
const builders: Record<string, () => any> = {
  buildTimeseriesOptions: () => buildTimeseriesOptions(usage),
  buildPieOptions: () => buildPieOptions(usage),
  buildProjectTimeseriesOptions: () => buildProjectTimeseriesOptions([usage]),
  buildProjectPieOptions: () => buildProjectPieOptions([usage]),
  buildJobsTimeseriesOptions: () => buildJobsTimeseriesOptions(usage),
  buildJobsPieOptions: () => buildJobsPieOptions(usage),
  buildProjectJobsTimeseriesOptions: () =>
    buildProjectJobsTimeseriesOptions([usage]),
  buildProjectJobsPieOptions: () => buildProjectJobsPieOptions([usage]),
  buildAvgWaitTimeseriesOptions: () => buildAvgWaitTimeseriesOptions(usage),
  buildAvgWaitPieOptions: () => buildAvgWaitPieOptions(usage),
  buildStorageBarOptions: () => buildStorageBarOptions(storage),
  buildStorageTimeseriesOptions: () => buildStorageTimeseriesOptions(storage),
  buildStorageProjectBarOptions: () => buildStorageProjectBarOptions([storage]),
  buildStorageProjectTimeseriesOptions: () =>
    buildStorageProjectTimeseriesOptions([storage]),
};

describe('OpenPortal chart tooltips', () => {
  it.each(Object.keys(builders))(
    '%s confines its tooltip to the chart',
    (name) => {
      const options = builders[name]();
      expect(options.tooltip).toBeDefined();
      expect(options.tooltip.confine).toBe(true);
    },
  );
});
