/**
 * StorageReportVis — interactive ECharts visualisation for ProjectStorageReport data.
 *
 * Accepts an array of ProjectStorageReport instances (already fetched — no API
 * calls are made inside this component). Multiple reports are auto-combined.
 *
 * Interactive controls:
 *   - Chart type toggle: Bar (used vs limit per user) ↔ Timeline
 *   - By user / By project toggle (shown when multiple projects)
 *   - Day/Month toggle (timeline only)
 *   - Volume filter: show all volumes or drill into a single one (bar view, user mode)
 *   - ECharts built-ins: tooltip, save-as-image
 *
 * All filter state is local — zero re-fetches on interaction.
 */

import { FileArrowDownIcon, FileXlsIcon } from '@phosphor-icons/react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import { EChart } from '@waldur/core/EChart';
import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { ProjectStorageReport } from './ProjectStorageReport';
import { downloadStorageExcel, downloadJson } from './reportExcel';
import {
  buildStorageBarOptions,
  buildStorageTimeseriesOptions,
  buildStorageProjectBarOptions,
  buildStorageProjectTimeseriesOptions,
} from './storageChartOptions';
import { GroupBy, NameMaps } from './usageChartOptions';

type ChartView = 'bar' | 'timeseries';
type GroupMode = 'user' | 'project';

interface Props {
  /** One or more already-fetched reports. Multiple are combined client-side. */
  reports: ProjectStorageReport[];
  height?: string;
  nameMaps?: NameMaps;
}

export const StorageReportVis: FC<Props> = ({
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
          : ProjectStorageReport.combine(reports),
    [reports],
  );

  const volumes = useMemo(() => (report ? report.volumes() : []), [report]);

  const hasDailyData = useMemo(() => (report?.dates.length ?? 0) > 0, [report]);

  const [view, setView] = useState<ChartView>('bar');
  const [volumeFilter, setVolumeFilter] = useState<string>('all');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');
  const [groupMode] = useState<GroupMode>(
    multipleProjects ? 'project' : 'user',
  );
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

  const fullNames = multipleProjects && groupMode === 'user';
  const activeMaps = showMapped ? nameMaps : undefined;

  const options = useMemo(() => {
    computeStartRef.current = performance.now();
    if (!report) return {};
    if (groupMode === 'project') {
      return view === 'timeseries'
        ? buildStorageProjectTimeseriesOptions(reports, groupBy, activeMaps)
        : buildStorageProjectBarOptions(reports, activeMaps);
    }
    if (view === 'timeseries')
      return buildStorageTimeseriesOptions(
        report,
        groupBy,
        fullNames,
        activeMaps,
      );
    return buildStorageBarOptions(report, volumeFilter, fullNames, activeMaps);
  }, [
    report,
    reports,
    view,
    volumeFilter,
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
        {translate('No storage data available.')}
      </div>
    );
  }

  const numUsers = report.userIdentifiers().length;
  const numProjects = new Set(reports.map((r) => r.project)).size;
  const destination = reports[0]?.resource ?? '';
  const destinationLabel = nameMaps?.offering?.[destination] ?? destination;
  // Most recent generatedAt across all reports
  const lastGenerated = reports.reduce(
    (best, r) => (r.generatedAt > best ? r.generatedAt : best),
    reports[0].generatedAt,
  );

  return (
    <div>
      {/* ── Row 1: summary + downloads ───────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-2 flex-wrap">
        <span className="text-muted small">
          {translate(
            '{destination} · {numUsers} {user} · {numProjects} {project} · Last generated {date}',
            {
              destination: destinationLabel,
              numUsers,
              user: numUsers !== 1 ? translate('users') : translate('user'),
              numProjects,
              project:
                numProjects !== 1
                  ? translate('projects')
                  : translate('project'),
              date: lastGenerated.toLocaleString(),
            },
          )}
          {report.isEmpty && (
            <span className="badge bg-secondary ms-2">
              {translate('Empty')}
            </span>
          )}
        </span>

        <div className="d-flex gap-2 ms-auto">
          <Tip id="tip-storage-excel" label={translate('Download Excel')}>
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={async () => {
                setExcelProgress({ current: 0, total: 1 });
                await downloadStorageExcel(
                  report,
                  `storage_report`,
                  nameMaps,
                  (current, total) => setExcelProgress({ current, total }),
                );
                setExcelProgress(null);
              }}
            >
              <FileXlsIcon size={20} weight="bold" />
            </button>
          </Tip>
          <Tip id="tip-storage-json" label={translate('Download JSON')}>
            <button
              type="button"
              className="text-btn text-hover-primary"
              onClick={() =>
                downloadJson(
                  reports.map((r) => r.apiItem),
                  `storage_report.json`,
                )
              }
            >
              <FileArrowDownIcon size={20} weight="bold" />
            </button>
          </Tip>
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
        {/* Chart type */}
        <div className="btn-group btn-group-sm" role="group">
          <button
            type="button"
            className={`btn btn-${view === 'bar' ? 'primary' : 'secondary'}`}
            onClick={() => setView('bar')}
          >
            {translate('Bar')}
          </button>
          {hasDailyData && (
            <button
              type="button"
              className={`btn btn-${view === 'timeseries' ? 'primary' : 'secondary'}`}
              onClick={() => setView('timeseries')}
            >
              {translate('Timeline')}
            </button>
          )}
        </div>

        {/* Day / Month toggle — timeseries only */}
        {view === 'timeseries' && (
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn btn-${groupBy === 'day' ? 'primary' : 'secondary'}`}
              onClick={() => setGroupBy('day')}
            >
              {translate('Day')}
            </button>
            <button
              type="button"
              className={`btn btn-${groupBy === 'month' ? 'primary' : 'secondary'}`}
              onClick={() => setGroupBy('month')}
            >
              {translate('Month')}
            </button>
          </div>
        )}

        {/* Mapped names toggle — only shown when mappings are available */}
        {nameMaps && (
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn btn-${showMapped ? 'primary' : 'secondary'}`}
              onClick={() => setShowMapped(true)}
            >
              {translate('Names')}
            </button>
            <button
              type="button"
              className={`btn btn-${!showMapped ? 'primary' : 'secondary'}`}
              onClick={() => setShowMapped(false)}
            >
              {translate('IDs')}
            </button>
          </div>
        )}

        {/* Volume filter — only relevant for bar view, user mode */}
        {view === 'bar' && groupMode === 'user' && volumes.length > 1 && (
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={volumeFilter}
            onChange={(e) => setVolumeFilter(e.target.value)}
          >
            <option value="all">{translate('All volumes')}</option>
            {volumes.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* ── Chart ────────────────────────────────────────────────────── */}
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
        exportTitle={translate('{destination} storage', {
          destination: destinationLabel,
        })}
      />
    </div>
  );
};
