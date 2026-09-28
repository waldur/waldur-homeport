/**
 * UsageReportVis — interactive ECharts visualisation for ProjectUsageReport data.
 *
 * Accepts an array of ProjectUsageReport instances (already fetched — no API
 * calls are made inside this component). Multiple reports are auto-combined.
 *
 * Interactive controls:
 *   - Metric selector:     Usage (h) / Jobs / Avg Wait
 *   - Chart type toggle:   Timeseries ↔ Pie
 *   - Group-by toggle:     By user ↔ By project  (shown when multiple projects)
 *   - Day/Month toggle:    Day ↔ Month  (timeseries only)
 *   - Component selector:  Total / CPU / Memory / Billing / … (usage metric only)
 *   - ECharts built-ins:   legend click (show/hide users), dataZoom scrubber,
 *                          toolbox bar↔line toggle, save-as-image
 *
 * All filter state is local — zero re-fetches on interaction.
 */

import { FileArrowDownIcon, FileXlsIcon } from '@phosphor-icons/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { Badge, SegmentedControl, Tooltip } from 'waldur-ui';

import { EChart } from '@/core/EChart';
import { translate } from '@/i18n';

import { ProjectUsageReport } from './ProjectUsageReport';
import { downloadUsageExcel, downloadJson } from './reportExcel';
import {
  GroupBy,
  NameMaps,
  UsageComponent,
  UsageMetric,
  buildAvgWaitPieOptions,
  buildAvgWaitTimeseriesOptions,
  buildJobsPieOptions,
  buildJobsTimeseriesOptions,
  buildPieOptions,
  buildProjectAvgWaitPieOptions,
  buildProjectAvgWaitTimeseriesOptions,
  buildProjectJobsPieOptions,
  buildProjectJobsTimeseriesOptions,
  buildProjectPieOptions,
  buildProjectTimeseriesOptions,
  buildTimeseriesOptions,
} from './usageChartOptions';

type ChartView = 'timeseries' | 'pie';
type GroupMode = 'user' | 'project';

const getMetricLabels = () => ({
  usage: translate('Usage (h)'),
  jobs: translate('Jobs'),
  avg_wait: translate('Avg Wait'),
});

interface Props {
  /** One or more already-fetched reports. Multiple are combined client-side. */
  reports: ProjectUsageReport[];
  height?: string;
  nameMaps?: NameMaps;
}

export const UsageReportVis: FC<Props> = ({
  reports,
  height = '420px',
  nameMaps,
}) => {
  const multipleProjects = useMemo(
    () => new Set(reports.map((r) => r.project)).size > 1,
    [reports],
  );

  const report = useMemo(
    () =>
      reports.length === 0
        ? null
        : reports.length === 1
          ? reports[0]
          : ProjectUsageReport.combine(reports),
    [reports],
  );

  const components = useMemo(
    () => (report ? ['total', ...report.componentNames()] : ['total']),
    [report],
  );

  const [metric, setMetric] = useState<UsageMetric>('usage');
  const [view, setView] = useState<ChartView>('timeseries');
  const [component, setComponent] = useState<UsageComponent>('total');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [groupMode, setGroupMode] = useState<GroupMode>(
    multipleProjects ? 'project' : 'user',
  );
  // When nameMaps are available, default to showing mapped names; can be toggled
  const [showMapped, setShowMapped] = useState(true);

  // Animation auto-detect: disable animations when data sets are large
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('openportal-animations-disabled') !== '1';
    } catch {
      return true;
    }
  });
  const computeStartRef = useRef(0);

  // Updating indicator
  const [isUpdating, setIsUpdating] = useState(false);
  const updateRafRef = useRef<number | undefined>(undefined);

  // Excel download progress
  const [excelProgress, setExcelProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Use full usernames when viewing by user across multiple projects
  const fullNames = multipleProjects && groupMode === 'user';

  // Only pass nameMaps when the toggle is on
  const activeMaps = showMapped ? nameMaps : undefined;

  const options = useMemo(() => {
    computeStartRef.current = performance.now();
    if (groupMode === 'project') {
      if (metric === 'jobs') {
        return view === 'timeseries'
          ? buildProjectJobsTimeseriesOptions(reports, groupBy, activeMaps)
          : buildProjectJobsPieOptions(reports, activeMaps);
      }
      if (metric === 'avg_wait') {
        return view === 'timeseries'
          ? buildProjectAvgWaitTimeseriesOptions(reports, groupBy, activeMaps)
          : buildProjectAvgWaitPieOptions(reports, activeMaps);
      }
      return view === 'timeseries'
        ? buildProjectTimeseriesOptions(reports, component, groupBy, activeMaps)
        : buildProjectPieOptions(reports, activeMaps);
    }

    if (!report) return {};
    if (metric === 'jobs') {
      return view === 'timeseries'
        ? buildJobsTimeseriesOptions(report, groupBy, fullNames, activeMaps)
        : buildJobsPieOptions(report, fullNames, activeMaps);
    }
    if (metric === 'avg_wait') {
      return view === 'timeseries'
        ? buildAvgWaitTimeseriesOptions(report, groupBy, fullNames, activeMaps)
        : buildAvgWaitPieOptions(report, fullNames, activeMaps);
    }
    return view === 'timeseries'
      ? buildTimeseriesOptions(
          report,
          component,
          groupBy,
          fullNames,
          activeMaps,
        )
      : buildPieOptions(report, component, fullNames, activeMaps);
  }, [
    report,
    reports,
    metric,
    view,
    component,
    groupBy,
    groupMode,
    fullNames,
    activeMaps,
  ]);

  // Animation auto-detect effect
  useEffect(() => {
    const elapsed = performance.now() - computeStartRef.current;
    if (elapsed > 1000 && animationsEnabled) {
      setAnimationsEnabled(false);
      try {
        localStorage.setItem('openportal-animations-disabled', '1');
      } catch {
        /* do nothing */
      }
    }
  }, [options]);

  // Updating indicator effect
  useEffect(() => {
    setIsUpdating(true);
    updateRafRef.current = requestAnimationFrame(() => {
      updateRafRef.current = requestAnimationFrame(() => {
        setIsUpdating(false);
      });
    });
    return () => {
      if (updateRafRef.current !== undefined)
        cancelAnimationFrame(updateRafRef.current);
    };
  }, [options]);

  if (!report) {
    return (
      <div className="text-muted p-4">
        {translate('No usage data available.')}
      </div>
    );
  }

  const totalHours = report.totalUsageHours();
  const numUsers = report.localUsers().length;
  const numProjects = new Set(reports.map((r) => r.project)).size;
  const destination = reports[0]?.resource ?? '';
  const destinationLabel = nameMaps?.offering?.[destination] ?? destination;

  return (
    <div>
      {/* ── Row 1: summary + downloads ───────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
        <span className="text-muted small">
          {translate(
            '{destination} · {hours} h across {numUsers} {user} and {numProjects} {project}',
            {
              destination: destinationLabel,
              hours: totalHours.toFixed(1),
              numUsers,
              user: numUsers !== 1 ? translate('users') : translate('user'),
              numProjects,
              project:
                numProjects !== 1
                  ? translate('projects')
                  : translate('project'),
            },
          )}
          {!report.isComplete && (
            <Badge variant="warning" tone="solid" className="ms-2">
              {translate('In progress')}
            </Badge>
          )}
        </span>

        <div className="d-flex gap-2 ms-auto">
          <Tooltip label={translate('Download Excel')}>
            <button
              type="button"
              onClick={async () => {
                setExcelProgress({ current: 0, total: 1 });
                await downloadUsageExcel(
                  reports,
                  'usage_report',
                  nameMaps,
                  (current, total) => setExcelProgress({ current, total }),
                );
                setExcelProgress(null);
              }}
              className="text-btn text-hover-primary"
            >
              <FileXlsIcon size={20} weight="bold" />
            </button>
          </Tooltip>
          <Tooltip label={translate('Download JSON')}>
            <button
              type="button"
              onClick={() =>
                downloadJson(
                  reports.map((r) => r.apiItem),
                  'usage_report.json',
                )
              }
              className="text-btn text-hover-primary"
            >
              <FileArrowDownIcon size={20} weight="bold" />
            </button>
          </Tooltip>
        </div>
        {excelProgress && (
          <span className="text-muted small ms-2">
            {translate('Preparing Excel — sheet {current} of {total}…', {
              current: excelProgress.current,
              total: excelProgress.total,
            })}
          </span>
        )}
      </div>

      {/* ── Row 2: toggle controls ────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
        {/* Metric selector */}
        <SegmentedControl<UsageMetric>
          aria-label={translate('Metric')}
          size="sm"
          variant="brand"
          options={(Object.keys(getMetricLabels()) as UsageMetric[]).map(
            (m) => ({ value: m, label: getMetricLabels()[m] }),
          )}
          value={metric}
          onValueChange={setMetric}
        />

        {/* Timeseries / Pie toggle */}
        <SegmentedControl<ChartView>
          aria-label={translate('Chart type')}
          size="sm"
          variant="brand"
          options={[
            { value: 'timeseries', label: translate('Timeline') },
            { value: 'pie', label: translate('Pie') },
          ]}
          value={view}
          onValueChange={setView}
        />

        {/* Day / Month toggle — timeseries only */}
        {view === 'timeseries' && (
          <SegmentedControl<GroupBy>
            aria-label={translate('Interval')}
            size="sm"
            variant="brand"
            options={[
              { value: 'day', label: translate('Day') },
              { value: 'month', label: translate('Month') },
            ]}
            value={groupBy}
            onValueChange={setGroupBy}
          />
        )}

        {/* By user / By project toggle — only when multiple projects */}
        {multipleProjects && (
          <SegmentedControl<GroupMode>
            aria-label={translate('Group by')}
            size="sm"
            variant="brand"
            options={[
              { value: 'user', label: translate('By user') },
              { value: 'project', label: translate('By project') },
            ]}
            value={groupMode}
            onValueChange={setGroupMode}
          />
        )}

        {/* Mapped names toggle — only shown when mappings are available */}
        {nameMaps && (
          <SegmentedControl<'names' | 'ids'>
            aria-label={translate('Show as')}
            size="sm"
            variant="brand"
            options={[
              { value: 'names', label: translate('Names') },
              { value: 'ids', label: translate('IDs') },
            ]}
            value={showMapped ? 'names' : 'ids'}
            onValueChange={(next) => setShowMapped(next === 'names')}
          />
        )}

        {/* Component filter — only relevant for usage metric, user mode */}
        {metric === 'usage' &&
          groupMode === 'user' &&
          components.length > 1 && (
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={component}
              onChange={(e) => setComponent(e.target.value as UsageComponent)}
            >
              {components.map((c) => (
                <option key={c} value={c}>
                  {c === 'total'
                    ? translate('All usage')
                    : c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          )}
      </div>

      {/* ── Chart ─────────────────────────────────────────}─ */}
      {/* Updating indicator */}
      {isUpdating && (
        <div className="text-muted small mb-1" style={{ minHeight: '1.2em' }}>
          <span
            className="spinner-border spinner-border-sm me-1"
            style={{ width: '0.75rem', height: '0.75rem' }}
          />
          {translate('Updating...')}
        </div>
      )}
      <EChart
        options={animationsEnabled ? options : { ...options, animation: false }}
        height={height}
        exportTitle={`${destinationLabel} ${getMetricLabels()[metric]}`}
      />
    </div>
  );
};
