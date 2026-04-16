/**
 * Organisation-level allocation summary tab.
 *
 * Fetches ProjectAccountingSummary records for all projects in the current
 * customer organisation via the openportal-accounting-summary endpoint.
 *
 * Features:
 *   - Project filter dialog  — same look as OrganisationReportsTab
 *   - Summary statistics     — total credits awarded / spent / remaining
 *   - Stacked bar chart      — predicted daily credits-remaining per project,
 *                              assuming linear burn from today → end date
 *   - Line chart toggle      — same data rendered as stacked area lines
 *   - Warning notice         — projects without end dates (credits untracked)
 *
 * Visible to staff and support users only (via route permissions).
 */

/* eslint-disable waldur-custom/no-direct-bootstrap-button */
import { FileXlsIcon, WarningCircleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { DateTime } from 'luxon';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Tab,
  Tabs,
} from 'react-bootstrap';
import { useSelector } from 'react-redux';
import type { ProjectAccountingSummary } from 'waldur-js-client';
import {
  openportalAccountingSummaryList,
  projectsList,
} from 'waldur-js-client';

import { getNextPageUrl } from '@waldur/core/api';
import { Badge } from '@waldur/core/Badge';
import { ENV } from '@waldur/core/config';
import { EChart } from '@waldur/core/EChart';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { Tip } from '@waldur/core/Tooltip';
import { formatJsxTemplate, translate } from '@waldur/i18n';
import { getCustomer } from '@waldur/workspace/selectors';

import type { OpenPortalProject } from './api';
import {
  clearCached,
  formatCacheAge,
  getCacheAge,
  getCached,
  setCached,
  TTL,
} from './localStorageCache';
import { downloadAllocationExcel } from './reportExcel';
import { StageProgress } from './StageProgress';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse a decimal string from the API into a float. */
const parseCredits = (v: string): number => parseFloat(v) || 0;

/** Format a credit value for display (2 d.p., thousands separators). */
const fmtCredits = (v: number): string =>
  v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** Number of whole calendar days between two dates (b − a). */
const daysBetween = (a: DateTime, b: DateTime): number =>
  Math.round(b.diff(a, 'days').days);

// ── Chart builder ─────────────────────────────────────────────────────────────

type ChartType = 'bar' | 'line';
type GroupBy = 'day' | 'month';

/**
 * Compute remaining credits for a project at a given reference date.
 * Returns 0 if the reference date is on or after the project end date.
 */
const remainingAtDate = (
  remaining: number,
  totalDays: number,
  today: DateTime,
  refDate: DateTime,
  endDate: DateTime,
): number => {
  if (refDate >= endDate) return 0;
  const daysFromToday = daysBetween(today, refDate);
  const daysLeft = totalDays - daysFromToday;
  return Math.max(0, Math.round((remaining * daysLeft) / totalDays));
};

const buildChartOptions = (
  summaries: ProjectAccountingSummary[],
  chartType: ChartType,
  groupBy: GroupBy,
  currencyName: string,
): object | null => {
  const today = DateTime.now().startOf('day');

  // Only projects with a future end date
  const eligible = summaries.filter((s) => {
    if (!s.end_date) return false;
    const end = DateTime.fromISO(s.end_date).startOf('day');
    return end > today;
  });

  if (eligible.length === 0) return null;

  const endDates = eligible.map((s) =>
    DateTime.fromISO(s.end_date!).startOf('day').toMillis(),
  );
  const maxEnd = DateTime.fromMillis(Math.max(...endDates));

  const isLine = chartType === 'line';

  let xLabels: string[];
  let refDates: DateTime[]; // the date used to sample remaining credits for each x point

  if (groupBy === 'month') {
    // One point per month: sample remaining credits at the last day of each month
    // (capped to the day before maxEnd)
    xLabels = [];
    refDates = [];
    let cursor = today.startOf('month');
    while (cursor < maxEnd) {
      const monthEnd = cursor.endOf('month').startOf('day');
      const refDate = monthEnd < maxEnd ? monthEnd : maxEnd.minus({ days: 1 });
      xLabels.push(cursor.toFormat('yyyy-MM'));
      refDates.push(refDate);
      cursor = cursor.plus({ months: 1 });
    }
  } else {
    // One point per day: today → day before maxEnd
    xLabels = [];
    refDates = [];
    let cursor = today;
    while (cursor < maxEnd) {
      xLabels.push(cursor.toFormat('yyyy-MM-dd'));
      refDates.push(cursor);
      cursor = cursor.plus({ days: 1 });
    }
  }

  if (xLabels.length === 0) return null;

  const series = eligible.map((s) => {
    const remaining =
      parseCredits(s.total_credits) -
      parseCredits(s.total_spend) -
      parseCredits(s.current_month_spend);

    const end = DateTime.fromISO(s.end_date!).startOf('day');
    const totalDays = Math.max(1, daysBetween(today, end));

    return {
      name: s.project_name,
      type: isLine ? 'line' : 'bar',
      stack: 'credits',
      ...(isLine ? { areaStyle: { opacity: 0.4 } } : {}),
      data: refDates.map((refDate) =>
        remainingAtDate(remaining, totalDays, today, refDate, end),
      ),
    };
  });

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: isLine ? 'cross' : 'shadow' },
      formatter: (params: any[]) => {
        const active = params
          .filter((p) => p.value !== 0 && p.value != null)
          .sort((a, b) => b.value - a.value);
        if (active.length === 0) return params[0]?.axisValueLabel ?? '';
        const TOP = 25;
        const shown = active.slice(0, TOP);
        const rest = active.slice(TOP);
        const othersTotal = rest.reduce((s, p) => s + Number(p.value), 0);
        const rows = shown
          .map(
            (p) =>
              `${p.marker}${p.seriesName}: <b>${Number(p.value).toFixed(2)}</b>`,
          )
          .join('<br/>');
        const othersRow =
          rest.length > 0
            ? `<br/>Others (${rest.length}): <b>${othersTotal.toFixed(2)}</b>`
            : '';
        return `${active[0].axisValueLabel}<br/>${rows}${othersRow}`;
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: {
        rotate: 45,
        interval: groupBy === 'day' ? 6 : 0,
      },
    },
    yAxis: {
      type: 'value',
      name: translate('{currencyName} remaining', { currencyName }),
    },
    dataZoom: [{ type: 'slider', bottom: 35 }],
    series,
  };
};

// ── Consumption chart builder ─────────────────────────────────────────────────

/**
 * Builds ECharts options for the predicted daily/monthly consumption chart.
 * Each project's daily consumption rate = remaining / totalDays (linear burn).
 * For monthly grouping, rates are summed over the active days in each month.
 */
const buildConsumptionChartOptions = (
  summaries: ProjectAccountingSummary[],
  chartType: ChartType,
  groupBy: GroupBy,
  currencyName: string,
): object | null => {
  const today = DateTime.now().startOf('day');

  const eligible = summaries.filter((s) => {
    if (!s.end_date) return false;
    const end = DateTime.fromISO(s.end_date).startOf('day');
    return end > today;
  });

  if (eligible.length === 0) return null;

  const endDates = eligible.map((s) =>
    DateTime.fromISO(s.end_date!).startOf('day').toMillis(),
  );
  const maxEnd = DateTime.fromMillis(Math.max(...endDates));

  const isLine = chartType === 'line';

  // Per-project: constant daily consumption rate over project lifetime
  const projectData = eligible.map((s) => {
    const remaining =
      parseCredits(s.total_credits) -
      parseCredits(s.total_spend) -
      parseCredits(s.current_month_spend);
    const end = DateTime.fromISO(s.end_date!).startOf('day');
    const totalDays = Math.max(1, daysBetween(today, end));
    return {
      name: s.project_name,
      dailyRate: Math.max(0, remaining) / totalDays,
      end,
    };
  });

  const round2 = (n: number) => Math.round(n * 100) / 100;

  let xLabels: string[];
  let series: object[];

  if (groupBy === 'day') {
    xLabels = [];
    let cursor = today;
    while (cursor < maxEnd) {
      xLabels.push(cursor.toFormat('yyyy-MM-dd'));
      cursor = cursor.plus({ days: 1 });
    }
    series = projectData.map(({ name, dailyRate, end }) => ({
      name,
      type: isLine ? 'line' : 'bar',
      stack: 'consumption',
      ...(isLine ? { areaStyle: { opacity: 0.4 } } : {}),
      data: xLabels.map((dateStr) => {
        const d = DateTime.fromISO(dateStr);
        return d < end ? round2(dailyRate) : 0;
      }),
    }));
  } else {
    // Monthly: sum dailyRate × active days in that month
    xLabels = [];
    const monthStarts: DateTime[] = [];
    let cursor = today.startOf('month');
    while (cursor < maxEnd) {
      xLabels.push(cursor.toFormat('yyyy-MM'));
      monthStarts.push(cursor);
      cursor = cursor.plus({ months: 1 });
    }
    series = projectData.map(({ name, dailyRate, end }) => ({
      name,
      type: isLine ? 'line' : 'bar',
      stack: 'consumption',
      ...(isLine ? { areaStyle: { opacity: 0.4 } } : {}),
      data: monthStarts.map((monthStart) => {
        const monthEnd = monthStart.endOf('month').startOf('day');
        // Active window: [max(today, monthStart), min(end-1, monthEnd)]
        const activeStart = monthStart >= today ? monthStart : today;
        const projectLastDay = end.minus({ days: 1 });
        const activeEnd =
          projectLastDay <= monthEnd ? projectLastDay : monthEnd;
        const activeDays =
          activeEnd >= activeStart
            ? daysBetween(activeStart, activeEnd) + 1
            : 0;
        return round2(dailyRate * activeDays);
      }),
    }));
  }

  if (xLabels.length === 0) return null;

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: isLine ? 'cross' : 'shadow' },
      formatter: (params: any[]) => {
        const active = params
          .filter((p) => p.value !== 0 && p.value != null)
          .sort((a, b) => b.value - a.value);
        if (active.length === 0) return params[0]?.axisValueLabel ?? '';
        const TOP = 25;
        const shown = active.slice(0, TOP);
        const rest = active.slice(TOP);
        const othersTotal = rest.reduce((s, p) => s + Number(p.value), 0);
        const rows = shown
          .map(
            (p) =>
              `${p.marker}${p.seriesName}: <b>${Number(p.value).toFixed(2)}</b>`,
          )
          .join('<br/>');
        const othersRow =
          rest.length > 0
            ? `<br/>Others (${rest.length}): <b>${othersTotal.toFixed(2)}</b>`
            : '';
        return `${active[0].axisValueLabel}<br/>${rows}${othersRow}`;
      },
    },
    legend: { type: 'scroll', bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: { rotate: 45, interval: groupBy === 'day' ? 6 : 0 },
    },
    yAxis: {
      type: 'value',
      name:
        groupBy === 'day'
          ? translate('{currencyName} / day', { currencyName })
          : translate('{currencyName} / month', { currencyName }),
    },
    dataZoom: [{ type: 'slider', bottom: 35 }],
    series,
  };
};

// ── Project filter dialog ─────────────────────────────────────────────────────

interface ProjectFilterDialogProps {
  projects: OpenPortalProject[];
  selected: Set<string>;
  onConfirm: (next: Set<string>) => void;
  onClose: () => void;
}

const ProjectFilterDialog: FC<ProjectFilterDialogProps> = ({
  projects,
  selected,
  onConfirm,
  onClose,
}) => {
  const [draft, setDraft] = useState(() => new Set(selected));
  const [nameFilter, setNameFilter] = useState('');
  const [startAfter, setStartAfter] = useState('');
  const [endBefore, setEndBefore] = useState('');

  const visible = useMemo(
    () =>
      projects.filter((p) => {
        if (
          nameFilter &&
          !p.name.toLowerCase().includes(nameFilter.toLowerCase())
        )
          return false;
        if (
          startAfter &&
          p.start_date &&
          DateTime.fromISO(p.start_date) < DateTime.fromISO(startAfter)
        )
          return false;
        if (
          endBefore &&
          p.end_date &&
          DateTime.fromISO(p.end_date) > DateTime.fromISO(endBefore)
        )
          return false;
        return true;
      }),
    [projects, nameFilter, startAfter, endBefore],
  );

  const allVisibleSelected = visible.every((p) => draft.has(p.uuid));

  const toggleAll = () => {
    const next = new Set(draft);
    if (allVisibleSelected) visible.forEach((p) => next.delete(p.uuid));
    else visible.forEach((p) => next.add(p.uuid));
    setDraft(next);
  };

  const toggle = (uuid: string) => {
    const next = new Set(draft);
    if (next.has(uuid)) next.delete(uuid);
    else next.add(uuid);
    setDraft(next);
  };

  return (
    <Modal show onHide={onClose} size="lg" scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{translate('Select projects')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-2 mb-3">
          <Col xs={12} md={4}>
            <Form.Label className="small mb-1">
              {translate('Search')}
            </Form.Label>
            <Form.Control
              size="sm"
              type="text"
              placeholder={translate('Filter by name…')}
              value={nameFilter}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNameFilter(e.target.value)
              }
            />
          </Col>
          <Col xs={6} md={4}>
            <Form.Label className="small mb-1">
              {translate('Start date — after')}
            </Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={startAfter}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setStartAfter(e.target.value)
              }
            />
          </Col>
          <Col xs={6} md={4}>
            <Form.Label className="small mb-1">
              {translate('End date — before')}
            </Form.Label>
            <Form.Control
              size="sm"
              type="date"
              value={endBefore}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEndBefore(e.target.value)
              }
            />
          </Col>
        </Row>

        <div className="d-flex align-items-center gap-2 mb-2">
          <Form.Check
            id="alloc-select-all"
            checked={allVisibleSelected && visible.length > 0}
            onChange={toggleAll}
            className="mb-0"
            label={
              <span className="small">
                {allVisibleSelected
                  ? translate('Deselect all visible')
                  : translate('Select all visible')}
                ({visible.length})
              </span>
            }
          />
          <span className="ms-auto text-muted small">
            {translate('{count} of {total} selected', {
              count: draft.size,
              total: projects.length,
            })}
          </span>
        </div>

        <div
          style={{ maxHeight: 320, overflowY: 'auto' }}
          className="border rounded p-2"
        >
          {visible.length === 0 && (
            <p className="text-muted small mb-0 p-2">
              {translate('No projects match the filters.')}
            </p>
          )}
          {visible.map((p) => (
            <div key={p.uuid} className="py-1">
              <Form.Check className="d-flex align-items-start gap-2 mb-0">
                <Form.Check.Input
                  id={`alloc-proj-${p.uuid}`}
                  className="mt-1 m-0"
                  checked={draft.has(p.uuid)}
                  onChange={() => toggle(p.uuid)}
                />
                <Form.Check.Label
                  htmlFor={`alloc-proj-${p.uuid}`}
                  className="flex-grow-1"
                  style={{ cursor: 'pointer' }}
                >
                  <span className="fw-semibold">{p.name}</span>
                  {(p.start_date || p.end_date) && (
                    <span className="text-muted small ms-2">
                      {p.start_date ?? '?'} →{' '}
                      {p.end_date ?? translate('ongoing')}
                    </span>
                  )}
                  {p.is_in_grace_period && (
                    <Badge
                      variant="warning"
                      outline
                      className="ms-2"
                      style={{ fontSize: '0.7em' }}
                    >
                      {translate('In grace')}
                    </Badge>
                  )}
                  {p.is_expired && !p.is_in_grace_period && (
                    <Badge
                      variant="default"
                      outline
                      className="ms-2"
                      style={{ fontSize: '0.7em' }}
                    >
                      {translate('Finished')}
                    </Badge>
                  )}
                </Form.Check.Label>
              </Form.Check>
            </div>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" size="sm" onClick={onClose}>
          {translate('Cancel')}
        </Button>
        <Button variant="primary" size="sm" onClick={() => onConfirm(draft)}>
          {draft.size === 1
            ? translate('Apply')
            : translate('Apply ({count} projects)', {
                count: draft.size,
              })}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ── Summary stat card ─────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const StatCard: FC<StatCardProps> = ({ label, value, variant = 'default' }) => {
  const textClass =
    variant === 'success'
      ? 'text-success'
      : variant === 'warning'
        ? 'text-warning'
        : variant === 'danger'
          ? 'text-danger'
          : '';

  return (
    <Card
      className="flex-fill"
      border={variant !== 'default' ? variant : undefined}
      style={{ minWidth: 180 }}
    >
      <Card.Body className="py-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className={`fs-5 fw-bold ${textClass}`}>
          {(variant === 'warning' || variant === 'danger') && (
            <WarningCircleIcon className="me-1" size={18} weight="fill" />
          )}
          {value}
        </div>
      </Card.Body>
    </Card>
  );
};

// ── Main tab ──────────────────────────────────────────────────────────────────

export const OrganisationAllocationTab: FC = () => {
  const customer = useSelector(getCustomer);

  // ── Lazy-load — don't fire until user clicks "Load data" ─────────────────
  const [loadTriggered, setLoadTriggered] = useState(false);
  const [showLoadPrompt, setShowLoadPrompt] = useState(true);
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStartAfter, setProjectStartAfter] = useState('');
  const [projectEndBefore, setProjectEndBefore] = useState('');

  // ── Fetch all projects in the organisation ──────────────────────────────
  const [projectProgress, setProjectProgress] = useState({
    done: 0,
    total: 0,
    statusMsg: '',
  });

  const {
    data: projects,
    isLoading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useQuery({
    queryKey: [
      'openportal-alloc-projects',
      customer?.uuid,
      projectSearch,
      projectStartAfter,
      projectEndBefore,
      'terminated',
    ],
    queryFn: async () => {
      const cacheKey = `alloc-projects-${customer!.uuid}-${projectSearch}-${projectStartAfter}-${projectEndBefore}-include_terminated`;
      const cached = getCached<OpenPortalProject[]>(cacheKey, TTL.LISTS);
      if (cached) return cached;
      let allProjects: OpenPortalProject[] = [];
      let page = 1;
      let totalPages: number | undefined;
      setProjectProgress({
        done: 0,
        total: 0,
        statusMsg: translate('Starting…'),
      });
      while (true) {
        const result = await projectsList({
          query: {
            customer: customer!.uuid,
            page_size: 25,
            o: ['name'],
            page,
            include_terminated: true,
            ...(projectSearch ? { query: projectSearch } : {}),
            ...(projectStartAfter
              ? { start_date_after: projectStartAfter }
              : {}),
            ...(projectEndBefore ? { end_date_before: projectEndBefore } : {}),
            ended: false,
          } as any,
        });
        allProjects = allProjects.concat(result.data);
        if (page === 1) {
          const count = (result.response as any)?.data?.count;
          if (typeof count === 'number') totalPages = Math.ceil(count / 25);
        }
        setProjectProgress({
          done: page,
          total: totalPages ?? 0,
          statusMsg: totalPages
            ? translate('Downloading page {page} of {totalPages}', {
                page,
                totalPages,
              })
            : translate('Downloading page {page}…', { page }),
        });
        if (!getNextPageUrl(result.response)) break;
        page++;
      }
      setCached(cacheKey, allProjects);
      return allProjects;
    },
    enabled: !!customer && loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // ── Project selection ───────────────────────────────────────────────────
  const allProjectUuids = useMemo(
    () => new Set((projects ?? []).map((p) => p.uuid)),
    [projects],
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  const effectiveSelected =
    selectedProjects.size > 0 ? selectedProjects : allProjectUuids;

  // ── Fetch accounting summaries for the organisation ─────────────────────
  const [summariesProgress, setSummariesProgress] = useState({
    done: 0,
    total: 0,
    statusMsg: '',
  });

  const {
    data: allSummaries,
    isLoading: summariesLoading,
    error: summariesError,
    refetch: refetchSummaries,
  } = useQuery({
    queryKey: ['openportal-accounting-summary', customer?.uuid],
    queryFn: async () => {
      const cacheKey = `alloc-summaries-${customer!.uuid}`;
      const cached = getCached<ProjectAccountingSummary[]>(cacheKey, TTL.LISTS);
      if (cached) return cached;
      let allItems: ProjectAccountingSummary[] = [];
      let page = 1;
      let totalPages: number | undefined;
      setSummariesProgress({
        done: 0,
        total: 0,
        statusMsg: translate('Starting…'),
      });
      while (true) {
        const result = await openportalAccountingSummaryList({
          query: { customer_uuid: customer!.uuid, page_size: 100, page },
        });
        allItems = allItems.concat(result.data);
        if (page === 1) {
          const count = (result.response as any)?.data?.count;
          if (typeof count === 'number') totalPages = Math.ceil(count / 100);
        }
        setSummariesProgress({
          done: page,
          total: totalPages ?? 0,
          statusMsg: totalPages
            ? translate('Downloading page {page} of {totalPages}', {
                page,
                totalPages,
              })
            : translate('Downloading page {page}…', { page }),
        });
        if (!getNextPageUrl(result.response)) break;
        page++;
      }
      setCached(cacheKey, allItems);
      return allItems;
    },
    enabled: !!customer && loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  // ── Filter summaries to selected projects ───────────────────────────────
  const summaries = useMemo(
    () =>
      (allSummaries ?? []).filter((s) => effectiveSelected.has(s.project_uuid)),
    [allSummaries, effectiveSelected],
  );

  // ── Aggregate stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const today = DateTime.now().startOf('day');
    let totalCredits = 0;
    let totalSpent = 0;
    let totalSpentThisMonth = 0;
    let predictedDailyToday = 0;
    for (const s of summaries) {
      totalCredits += parseCredits(s.total_credits);
      totalSpent +=
        parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
      totalSpentThisMonth += parseCredits(s.current_month_spend);
      if (s.end_date) {
        const end = DateTime.fromISO(s.end_date).startOf('day');
        if (end > today) {
          const remaining = Math.max(
            0,
            parseCredits(s.total_credits) -
              parseCredits(s.total_spend) -
              parseCredits(s.current_month_spend),
          );
          predictedDailyToday +=
            remaining / Math.max(1, daysBetween(today, end));
        }
      }
    }
    const actualDailyAvg = totalSpentThisMonth / Math.max(1, today.day);
    return {
      totalCredits,
      totalSpent,
      totalSpentThisMonth,
      remaining: totalCredits - totalSpent,
      predictedDailyToday,
      actualDailyAvg,
    };
  }, [summaries]);

  // ── Burn-down chart controls ────────────────────────────────────────────
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [groupBy, setGroupBy] = useState<GroupBy>('day');

  // ── Consumption chart controls ──────────────────────────────────────────
  const [consumptionChartType, setConsumptionChartType] =
    useState<ChartType>('bar');
  const [consumptionGroupBy, setConsumptionGroupBy] = useState<GroupBy>('day');

  // ── Slow-load warning ───────────────────────────────────────────────────
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  const loadingStage = projectsLoading ? 1 : summariesLoading ? 2 : 0;

  useEffect(() => {
    const isLoading = projectsLoading || summariesLoading;
    if (!isLoading) {
      setShowSlowWarning(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowWarning(true), 5000);
    return () => clearTimeout(timer);
  }, [projectsLoading, summariesLoading]);

  // ── Excel download progress ─────────────────────────────────────────────
  const [excelProgress, setExcelProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  const currencyName = ENV.plugins.WALDUR_CORE.CURRENCY_NAME;

  // ── Chart options ───────────────────────────────────────────────────────
  const chartOptions = useMemo(
    () => buildChartOptions(summaries, chartType, groupBy, currencyName),
    [summaries, chartType, groupBy, currencyName],
  );

  const consumptionOptions = useMemo(
    () =>
      buildConsumptionChartOptions(
        summaries,
        consumptionChartType,
        consumptionGroupBy,
        currencyName,
      ),
    [summaries, consumptionChartType, consumptionGroupBy, currencyName],
  );

  // ── Concerning projects ─────────────────────────────────────────────────
  const [thresholds, setThresholds] = useState({
    slowStartMonths: 2,
    slowStartPercent: 5,
    inactiveMonths: 2,
    inactiveDayOfMonth: 10,
    inactiveRemainingPercent: 10,
    depletedSpentPercent: 90,
    depletedDaysRemaining: 60,
    offTrackPercent: 40,
    offTrackDayOfMonth: 5,
  });
  const setThreshold = (key: keyof typeof thresholds, raw: string) => {
    const v = parseFloat(raw);
    setThresholds((prev: typeof thresholds) => ({
      ...prev,
      [key]: isNaN(v) || v < 0 ? 0 : v,
    }));
  };
  const [showThresholds, setShowThresholds] = useState(false);
  const [concerningTab, setConcerningTab] = useState<
    'slowStart' | 'inactive' | 'depleted' | 'offTrack'
  >('slowStart');

  const { slowStart, inactive, depleted, offTrack } = useMemo(() => {
    const now = DateTime.now();
    const monthsElapsed = (dateStr: string) => {
      const s = DateTime.fromISO(dateStr);
      return (now.year - s.year) * 12 + (now.month - s.month);
    };
    const daysUntil = (dateStr: string) => {
      const end = DateTime.fromISO(dateStr).startOf('day');
      const today = DateTime.now().startOf('day');
      return daysBetween(today, end);
    };

    const slowStart = summaries.filter((s: ProjectAccountingSummary) => {
      if (
        s.start_date &&
        monthsElapsed(s.start_date) < thresholds.slowStartMonths
      )
        return false;
      const spent =
        parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
      const totalAlloc = parseCredits(s.total_credits);
      if (totalAlloc === 0) return false;
      return (spent / totalAlloc) * 100 < thresholds.slowStartPercent;
    });

    const inactive = summaries.filter((s: ProjectAccountingSummary) => {
      if (now.day < thresholds.inactiveDayOfMonth) return false;
      if (
        s.start_date &&
        monthsElapsed(s.start_date) < thresholds.inactiveMonths
      )
        return false;
      if (parseCredits(s.current_month_spend) >= 0.01) return false;
      const spent =
        parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
      const totalAlloc = parseCredits(s.total_credits);
      const remaining = totalAlloc - spent;
      if (totalAlloc === 0) return false;
      return (
        (remaining / totalAlloc) * 100 > thresholds.inactiveRemainingPercent
      );
    });

    const depleted = summaries.filter((s: ProjectAccountingSummary) => {
      if (!s.end_date) return false;
      if (daysUntil(s.end_date) < thresholds.depletedDaysRemaining)
        return false;
      const spent =
        parseCredits(s.total_spend) + parseCredits(s.current_month_spend);
      const totalAlloc = parseCredits(s.total_credits);
      if (totalAlloc === 0) return false;
      return (spent / totalAlloc) * 100 >= thresholds.depletedSpentPercent;
    });

    const offTrack = summaries.filter((s: ProjectAccountingSummary) => {
      if (!s.end_date) return false;
      const end = DateTime.fromISO(s.end_date).startOf('day');
      if (end <= now.startOf('day')) return false;
      if (now.day < thresholds.offTrackDayOfMonth) return false;
      const remaining = Math.max(
        0,
        parseCredits(s.total_credits) -
          parseCredits(s.total_spend) -
          parseCredits(s.current_month_spend),
      );
      const predictedDaily =
        remaining / Math.max(1, daysBetween(now.startOf('day'), end));
      if (predictedDaily === 0) return false;
      const actualDaily =
        parseCredits(s.current_month_spend) / Math.max(1, now.day);
      const ratio = actualDaily / predictedDaily;
      const deviation = thresholds.offTrackPercent / 100;
      return ratio < 1 - deviation || ratio > 1 + deviation;
    });

    return { slowStart, inactive, depleted, offTrack };
  }, [summaries, thresholds]);

  // ── Projects without end dates ──────────────────────────────────────────
  const noEndDateSummaries = useMemo(
    () => summaries.filter((s) => !s.end_date),
    [summaries],
  );

  const noEndDateUnspent = useMemo(
    () =>
      noEndDateSummaries.reduce(
        (acc, s) =>
          acc +
          Math.max(
            0,
            parseCredits(s.total_credits) -
              parseCredits(s.total_spend) -
              parseCredits(s.current_month_spend),
          ),
        0,
      ),
    [noEndDateSummaries],
  );

  return (
    <Container fluid className="py-4">
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h4 className="mb-0">{translate('Allocation Summary')}</h4>

        {projects && projects.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              {translate('{count} of {total} {project} selected', {
                count: effectiveSelected.size,
                total: projects.length,
                project:
                  projects.length !== 1
                    ? translate('projects')
                    : translate('project'),
              })}
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setDialogOpen(true)}
            >
              {translate('Filter selected projects')}
            </Button>
          </div>
        )}

        {loadTriggered && (
          <div className="ms-auto d-flex align-items-center gap-2">
            {(() => {
              const age = customer
                ? getCacheAge(`alloc-summaries-${customer.uuid}`)
                : null;
              return age ? (
                <span className="text-muted small">
                  {translate('Cached {age}', { age: formatCacheAge(age) })}
                </span>
              ) : null;
            })()}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (customer) {
                  clearCached(
                    `alloc-projects-${customer.uuid}`,
                    `alloc-summaries-${customer.uuid}`,
                  );
                }
                refetchProjects();
                if (loadTriggered) refetchSummaries();
              }}
            >
              {translate('Refresh')}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setShowLoadPrompt(true);
                setLoadTriggered(false);
              }}
            >
              {translate('Load new data…')}
            </Button>
          </div>
        )}
      </div>

      {/* ── Status ─────────────────────────────────────────────────────── */}
      {loadingStage === 1 && (
        <StageProgress
          stage={1}
          total={2}
          label={translate('Loading project list')}
          done={projectProgress.done}
          max={projectProgress.total}
          statusMsg={projectProgress.statusMsg || undefined}
        />
      )}

      {projectsError && (
        <LoadingErred
          message={translate('Failed to load projects')}
          loadData={refetchProjects}
        />
      )}

      {summariesError && (
        <LoadingErred
          message={translate('Failed to load accounting summaries')}
          loadData={refetchSummaries}
        />
      )}

      {/* Load prompt — shown before the user triggers the fetch */}
      {showLoadPrompt && !loadTriggered && (
        <Card className="mb-4">
          <Card.Body>
            <p className="mb-1 fw-semibold">
              {translate('Allocation data not yet loaded')}
            </p>
            <p className="mb-3 text-muted small">
              {translate(
                'Loading computes summaries for every project in this organisation and may take 10–15 seconds. You can optionally filter to a subset of projects first to speed things up.',
              )}
            </p>

            {/* Project pre-filters */}
            <Row className="g-2 mb-3">
              <Col xs={12} md={4}>
                <Form.Label className="small mb-1">
                  {translate('Project search')}
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder={translate('Name search (applied at load time)…')}
                  value={projectSearch}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setProjectSearch(e.target.value)
                  }
                />
              </Col>
              <Col xs={6} md={4}>
                <Form.Label className="small mb-1">
                  {translate('Started after')}
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={projectStartAfter}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setProjectStartAfter(e.target.value)
                  }
                />
              </Col>
              <Col xs={6} md={4}>
                <Form.Label className="small mb-1">
                  {translate('Ended before')}
                </Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={projectEndBefore}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setProjectEndBefore(e.target.value)
                  }
                />
              </Col>
            </Row>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setLoadTriggered(true);
                setShowLoadPrompt(false);
              }}
            >
              {translate('Load data')}
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Progress bar while summaries are being fetched */}
      {loadingStage === 2 && (
        <StageProgress
          stage={2}
          total={2}
          label={translate('Loading allocation summaries')}
          done={summariesProgress.done}
          max={summariesProgress.total}
          statusMsg={summariesProgress.statusMsg || undefined}
        />
      )}

      {showSlowWarning && (
        <Alert
          variant="warning"
          className="d-flex align-items-start gap-3 mb-3"
        >
          <div className="flex-grow-1">
            <strong>{translate('This is taking a while.')}</strong>
            <div className="small mt-1">
              {translate(
                'To speed things up: use the project search or date filters to load fewer projects.',
              )}
            </div>
          </div>
          <Button
            variant="warning"
            size="sm"
            className="flex-shrink-0"
            onClick={() => window.location.reload()}
          >
            {translate('Cancel & reload')}
          </Button>
        </Alert>
      )}

      {loadTriggered &&
        !summariesLoading &&
        !summariesError &&
        summaries.length === 0 && (
          <p className="text-muted p-4">
            {translate(
              'No accounting summaries found for the selected projects.',
            )}
          </p>
        )}

      {/* ── Summary stats ───────────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <div className="d-flex flex-wrap gap-3 mb-4">
          <StatCard
            label={translate('Total {currencyName} awarded', { currencyName })}
            value={fmtCredits(stats.totalCredits)}
          />
          <StatCard
            label={translate('Total {currencyName} spent (all time)', {
              currencyName,
            })}
            value={fmtCredits(stats.totalSpent)}
          />
          <StatCard
            label={translate('Total {currencyName} spent (this month)', {
              currencyName,
            })}
            value={fmtCredits(stats.totalSpentThisMonth)}
          />
          <StatCard
            label={translate('Predicted daily spend (today)')}
            value={fmtCredits(stats.predictedDailyToday)}
          />
          <StatCard
            label={translate('Actual daily avg (this month)')}
            value={fmtCredits(stats.actualDailyAvg)}
            variant={
              stats.predictedDailyToday > 0
                ? (() => {
                    const ratio =
                      stats.actualDailyAvg / stats.predictedDailyToday;
                    if (ratio >= 0.8 && ratio <= 1.2) return 'success';
                    if (ratio >= 0.6 && ratio <= 1.4) return 'warning';
                    return 'danger';
                  })()
                : undefined
            }
          />
          <StatCard
            label={translate('Remaining {currencyName}', { currencyName })}
            value={fmtCredits(stats.remaining)}
          />
        </div>
      )}

      {/* ── Burn-down chart ─────────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="fw-semibold d-flex align-items-center gap-3">
            <span>{translate('Predicted allocation burn-down')}</span>

            {chartOptions && (
              <>
                <ButtonGroup size="sm" className="ms-auto">
                  <Button
                    variant={groupBy === 'day' ? 'primary' : 'secondary'}
                    onClick={() => setGroupBy('day')}
                  >
                    {translate('Day')}
                  </Button>
                  <Button
                    variant={groupBy === 'month' ? 'primary' : 'secondary'}
                    onClick={() => setGroupBy('month')}
                  >
                    {translate('Month')}
                  </Button>
                </ButtonGroup>

                <ButtonGroup size="sm">
                  <Button
                    variant={chartType === 'bar' ? 'primary' : 'secondary'}
                    onClick={() => setChartType('bar')}
                  >
                    {translate('Bar')}
                  </Button>
                  <Button
                    variant={chartType === 'line' ? 'primary' : 'secondary'}
                    onClick={() => setChartType('line')}
                  >
                    {translate('Line')}
                  </Button>
                </ButtonGroup>
              </>
            )}

            <Tip id="tip-alloc-excel" label={translate('Download Excel')}>
              <button
                type="button"
                className="text-btn text-hover-primary"
                onClick={async () => {
                  setExcelProgress({ current: 0, total: 1 });
                  await downloadAllocationExcel(
                    summaries,
                    currencyName,
                    `allocation-summary-${customer?.name ?? 'org'}`,
                    (current, total) => setExcelProgress({ current, total }),
                  );
                  setExcelProgress(null);
                }}
              >
                <FileXlsIcon size={20} weight="bold" />
              </button>
            </Tip>
            {excelProgress && (
              <span className="text-muted small ms-2">
                {translate('Preparing Excel — sheet {current} of {total}…', {
                  current: excelProgress.current,
                  total: excelProgress.total,
                })}
              </span>
            )}
          </Card.Header>
          <Card.Body>
            {chartOptions ? (
              <EChart options={chartOptions} height="420px" />
            ) : (
              <p className="text-muted mb-0">
                {translate(
                  'No projects with future end dates — nothing to plot.',
                )}
              </p>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Consumption chart ───────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="fw-semibold d-flex align-items-center gap-3">
            <span>{translate('Predicted daily consumption')}</span>

            {consumptionOptions && (
              <>
                <ButtonGroup size="sm" className="ms-auto">
                  <Button
                    variant={
                      consumptionGroupBy === 'day' ? 'primary' : 'secondary'
                    }
                    onClick={() => setConsumptionGroupBy('day')}
                  >
                    {translate('Day')}
                  </Button>
                  <Button
                    variant={
                      consumptionGroupBy === 'month' ? 'primary' : 'secondary'
                    }
                    onClick={() => setConsumptionGroupBy('month')}
                  >
                    {translate('Month')}
                  </Button>
                </ButtonGroup>

                <ButtonGroup size="sm">
                  <Button
                    variant={
                      consumptionChartType === 'bar' ? 'primary' : 'secondary'
                    }
                    onClick={() => setConsumptionChartType('bar')}
                  >
                    {translate('Bar')}
                  </Button>
                  <Button
                    variant={
                      consumptionChartType === 'line' ? 'primary' : 'secondary'
                    }
                    onClick={() => setConsumptionChartType('line')}
                  >
                    {translate('Line')}
                  </Button>
                </ButtonGroup>
              </>
            )}

            <Tip id="tip-consumption-excel" label={translate('Download Excel')}>
              <button
                type="button"
                className="text-btn text-hover-primary"
                onClick={async () => {
                  setExcelProgress({ current: 0, total: 1 });
                  await downloadAllocationExcel(
                    summaries,
                    currencyName,
                    `allocation-summary-${customer?.name ?? 'org'}`,
                    (current, total) => setExcelProgress({ current, total }),
                  );
                  setExcelProgress(null);
                }}
              >
                <FileXlsIcon size={20} weight="bold" />
              </button>
            </Tip>
            {excelProgress && (
              <span className="text-muted small ms-2">
                {translate('Preparing Excel — sheet {current} of {total}…', {
                  current: excelProgress.current,
                  total: excelProgress.total,
                })}
              </span>
            )}
          </Card.Header>
          <Card.Body>
            {consumptionOptions ? (
              <EChart options={consumptionOptions} height="420px" />
            ) : (
              <p className="text-muted mb-0">
                {translate(
                  'No projects with future end dates — nothing to plot.',
                )}
              </p>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Warning: projects without end dates ─────────────────────────── */}
      {noEndDateSummaries.length > 0 && (
        <Alert variant="warning">
          <div className="d-flex align-items-start gap-2 mb-2">
            <WarningCircleIcon
              size={20}
              className="text-warning"
              weight="bold"
            />
            <span>
              {noEndDateSummaries.length === 1
                ? translate(
                    '{count} project has no end date and is not shown in the burn-down chart. Together it represents <strong>{amount} {currencyName}</strong> of unspent allocation.',
                    {
                      count: noEndDateSummaries.length,
                      amount: fmtCredits(noEndDateUnspent),
                      currencyName,
                      strong: (text) => <strong>{text}</strong>,
                    },
                    formatJsxTemplate,
                  )
                : translate(
                    '{count} projects have no end date and are not shown in the burn-down chart. Together they represent <strong>{amount} {currencyName}</strong> of unspent allocation.',
                    {
                      count: noEndDateSummaries.length,
                      amount: fmtCredits(noEndDateUnspent),
                      currencyName,
                      strong: (text) => <strong>{text}</strong>,
                    },
                    formatJsxTemplate,
                  )}
            </span>
          </div>
          <ul className="mb-0 ps-4">
            {noEndDateSummaries.map((s) => {
              const unspent = Math.max(
                0,
                parseCredits(s.total_credits) -
                  parseCredits(s.total_spend) -
                  parseCredits(s.current_month_spend),
              );
              return (
                <li key={s.project_uuid}>
                  <a
                    href={`/projects/${s.project_uuid}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {s.project_name}
                  </a>
                  {translate(' — {unspent} {currency} unspent', {
                    unspent: fmtCredits(unspent),
                    currency: currencyName,
                  })}
                </li>
              );
            })}
          </ul>
        </Alert>
      )}

      {/* ── Concerning projects ─────────────────────────────────────────── */}
      {summaries.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="fw-semibold d-flex align-items-center gap-2">
            <span>{translate('Concerning Projects')}</span>
            {slowStart.length +
              inactive.length +
              depleted.length +
              offTrack.length >
              0 && (
              <Badge variant="warning" outline>
                {
                  new Set<string>([
                    ...slowStart.map(
                      (s: ProjectAccountingSummary) => s.project_uuid,
                    ),
                    ...inactive.map(
                      (s: ProjectAccountingSummary) => s.project_uuid,
                    ),
                    ...depleted.map(
                      (s: ProjectAccountingSummary) => s.project_uuid,
                    ),
                    ...offTrack.map(
                      (s: ProjectAccountingSummary) => s.project_uuid,
                    ),
                  ]).size
                }
              </Badge>
            )}
            <Button
              variant={showThresholds ? 'primary' : 'secondary'}
              size="sm"
              className="ms-auto"
              onClick={() => setShowThresholds((v: boolean) => !v)}
            >
              {translate('Thresholds')}
            </Button>
          </Card.Header>

          <Card.Body>
            {/* ── Threshold controls ──────────────────────────────────── */}
            {showThresholds && (
              <div className="p-3 mb-3 bg-light rounded small">
                <Row className="g-2">
                  <Col
                    xs={12}
                    className="d-flex align-items-center gap-2 flex-wrap"
                  >
                    <span className="fw-semibold" style={{ minWidth: 120 }}>
                      {translate('Slow start')}:
                    </span>
                    {translate(
                      'started ≥ {input1} months ago with < {input2} % of allocation spent',
                      {
                        input1: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.slowStartMonths}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold('slowStartMonths', e.target.value)
                            }
                          />
                        ),
                        input2: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.slowStartPercent}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold('slowStartPercent', e.target.value)
                            }
                          />
                        ),
                      },
                      formatJsxTemplate,
                    )}
                  </Col>
                  <Col
                    xs={12}
                    className="d-flex align-items-center gap-2 flex-wrap"
                  >
                    <span className="fw-semibold" style={{ minWidth: 120 }}>
                      {translate('Inactive')}:
                    </span>
                    {translate(
                      'started ≥ {input1} months ago, after the {input2} th of the month, no spend this month, > {input3} % remaining',
                      {
                        input1: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.inactiveMonths}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold('inactiveMonths', e.target.value)
                            }
                          />
                        ),
                        input2: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.inactiveDayOfMonth}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold('inactiveDayOfMonth', e.target.value)
                            }
                          />
                        ),
                        input3: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.inactiveRemainingPercent}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold(
                                'inactiveRemainingPercent',
                                e.target.value,
                              )
                            }
                          />
                        ),
                      },
                      formatJsxTemplate,
                    )}
                  </Col>
                  <Col
                    xs={12}
                    className="d-flex align-items-center gap-2 flex-wrap"
                  >
                    <span className="fw-semibold" style={{ minWidth: 120 }}>
                      {translate('Nearly depleted')}:
                    </span>
                    {translate(
                      '≥ {input1} % spent with ≥ {input2} days still remaining',
                      {
                        input1: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.depletedSpentPercent}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold(
                                'depletedSpentPercent',
                                e.target.value,
                              )
                            }
                          />
                        ),
                        input2: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 70 }}
                            value={thresholds.depletedDaysRemaining}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold(
                                'depletedDaysRemaining',
                                e.target.value,
                              )
                            }
                          />
                        ),
                      },
                      formatJsxTemplate,
                    )}
                  </Col>
                  <Col
                    xs={12}
                    className="d-flex align-items-center gap-2 flex-wrap"
                  >
                    <span className="fw-semibold" style={{ minWidth: 120 }}>
                      {translate('Off track')}:
                    </span>
                    {translate(
                      'after the {input1} th of the month, actual daily avg differs from predicted by > {input2} %',
                      {
                        input1: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.offTrackDayOfMonth}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold('offTrackDayOfMonth', e.target.value)
                            }
                          />
                        ),
                        input2: (
                          <Form.Control
                            type="number"
                            size="sm"
                            style={{ width: 60 }}
                            value={thresholds.offTrackPercent}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setThreshold('offTrackPercent', e.target.value)
                            }
                          />
                        ),
                      },
                      formatJsxTemplate,
                    )}
                  </Col>
                </Row>
              </div>
            )}

            {/* ── All clear message ──────────────────────────────────── */}
            {slowStart.length === 0 &&
              inactive.length === 0 &&
              depleted.length === 0 &&
              offTrack.length === 0 && (
                <p className="text-muted mb-0">
                  {translate(
                    '✓ No concerning projects found with the current thresholds.',
                  )}
                </p>
              )}

            {/* ── Tabs ──────────────────────────────────────────────── */}
            {(slowStart.length > 0 ||
              inactive.length > 0 ||
              depleted.length > 0 ||
              offTrack.length > 0) && (
              <Tabs
                activeKey={concerningTab}
                onSelect={(k) => setConcerningTab(k as any)}
                className="mb-3"
              >
                <Tab
                  eventKey="slowStart"
                  title={
                    <>
                      {translate('Slow start')}
                      {slowStart.length > 0 && (
                        <Badge variant="warning" outline className="ms-2">
                          {slowStart.length}
                        </Badge>
                      )}
                    </>
                  }
                >
                  <div>
                    <p className="text-muted small mb-2">
                      {translate(
                        'Started ≥ {months} {month} ago but spent less than {percent}% of their allocation — may not have got going yet.',
                        {
                          months: thresholds.slowStartMonths,
                          month:
                            thresholds.slowStartMonths !== 1
                              ? translate('months')
                              : translate('month'),
                          percent: thresholds.slowStartPercent,
                        },
                      )}
                    </p>
                    {slowStart.length === 0 ? (
                      <p className="text-muted mb-0">{translate('None.')}</p>
                    ) : (
                      <ul className="mb-0">
                        {slowStart.map((s: ProjectAccountingSummary) => {
                          const spent =
                            parseCredits(s.total_spend) +
                            parseCredits(s.current_month_spend);
                          const totalAlloc = parseCredits(s.total_credits);
                          const pct = (
                            (spent / (totalAlloc || 1)) *
                            100
                          ).toFixed(1);
                          return (
                            <li key={s.project_uuid} className="mb-1">
                              <a
                                href={`/projects/${s.project_uuid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.project_name}
                              </a>
                              {translate(
                                ' — started {date}, {pct}% spent ({spent} / {total} {currency})',
                                {
                                  date: s.start_date,
                                  pct,
                                  spent: fmtCredits(spent),
                                  total: fmtCredits(totalAlloc),
                                  currency: currencyName,
                                },
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </Tab>

                <Tab
                  eventKey="inactive"
                  title={
                    <>
                      {translate('Inactive')}
                      {inactive.length > 0 && (
                        <Badge variant="warning" outline className="ms-2">
                          {inactive.length}
                        </Badge>
                      )}
                    </>
                  }
                >
                  <div>
                    <p className="text-muted small mb-2">
                      {translate(
                        "Started ≥ {months} {month} ago, no spend recorded this month, and more than {percent}% of allocation still remaining. Note: only the current month's activity is visible here.",
                        {
                          months: thresholds.inactiveMonths,
                          month:
                            thresholds.inactiveMonths !== 1
                              ? translate('months')
                              : translate('month'),
                          percent: thresholds.inactiveRemainingPercent,
                        },
                      )}
                    </p>
                    {inactive.length === 0 ? (
                      <p className="text-muted mb-0">{translate('None.')}</p>
                    ) : (
                      <ul className="mb-0">
                        {inactive.map((s: ProjectAccountingSummary) => {
                          const spent =
                            parseCredits(s.total_spend) +
                            parseCredits(s.current_month_spend);
                          const totalAlloc = parseCredits(s.total_credits);
                          const remaining = totalAlloc - spent;
                          const pct = (
                            (remaining / (totalAlloc || 1)) *
                            100
                          ).toFixed(1);
                          return (
                            <li key={s.project_uuid} className="mb-1">
                              <a
                                href={`/projects/${s.project_uuid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.project_name}
                              </a>
                              {translate(
                                ' — started {date}, {noSpend}, {pct}% remaining ({remaining} / {total} {currency})',
                                {
                                  date: s.start_date,
                                  noSpend: translate('no spend this month'),
                                  pct,
                                  remaining: fmtCredits(remaining),
                                  total: fmtCredits(totalAlloc),
                                  currency: currencyName,
                                },
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </Tab>

                <Tab
                  eventKey="depleted"
                  title={
                    <>
                      {translate('Nearly depleted')}
                      {depleted.length > 0 && (
                        <Badge variant="danger" outline className="ms-2">
                          {depleted.length}
                        </Badge>
                      )}
                    </>
                  }
                >
                  <div>
                    <p className="text-muted small mb-2">
                      {translate(
                        'At least {percent}% of allocation spent, but still ≥ {days} days until the project ends — may need a top-up.',
                        {
                          percent: thresholds.depletedSpentPercent,
                          days: thresholds.depletedDaysRemaining,
                        },
                      )}
                    </p>
                    {depleted.length === 0 ? (
                      <p className="text-muted mb-0">{translate('None.')}</p>
                    ) : (
                      <ul className="mb-0">
                        {depleted.map((s: ProjectAccountingSummary) => {
                          const spent =
                            parseCredits(s.total_spend) +
                            parseCredits(s.current_month_spend);
                          const totalAlloc = parseCredits(s.total_credits);
                          const spentPct = (
                            (spent / (totalAlloc || 1)) *
                            100
                          ).toFixed(1);
                          const today = DateTime.now().startOf('day');
                          const end = DateTime.fromISO(s.end_date!).startOf(
                            'day',
                          );
                          const days = daysBetween(today, end);
                          return (
                            <li key={s.project_uuid} className="mb-1">
                              <a
                                href={`/projects/${s.project_uuid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.project_name}
                              </a>
                              {translate(
                                ' — {spentPct}% spent ({spent} / {total} {currency}), ends {date} ({days} days remaining)',
                                {
                                  spentPct,
                                  spent: fmtCredits(spent),
                                  total: fmtCredits(totalAlloc),
                                  currency: currencyName,
                                  date: s.end_date,
                                  days,
                                },
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </Tab>

                <Tab
                  eventKey="offTrack"
                  title={
                    <>
                      {translate('Off track')}
                      {offTrack.length > 0 && (
                        <Badge variant="warning" outline className="ms-2">
                          {offTrack.length}
                        </Badge>
                      )}
                    </>
                  }
                >
                  <div>
                    <p className="text-muted small mb-2">
                      {translate(
                        'After the {day}th of the month, actual daily average spend differs from predicted by more than {percent}%.',
                        {
                          day: thresholds.offTrackDayOfMonth,
                          percent: thresholds.offTrackPercent,
                        },
                      )}
                    </p>
                    {offTrack.length === 0 ? (
                      <p className="text-muted mb-0">{translate('None.')}</p>
                    ) : (
                      <ul className="mb-0">
                        {offTrack.map((s: ProjectAccountingSummary) => {
                          const today = DateTime.now().startOf('day');
                          const end = DateTime.fromISO(s.end_date!).startOf(
                            'day',
                          );
                          const remaining = Math.max(
                            0,
                            parseCredits(s.total_credits) -
                              parseCredits(s.total_spend) -
                              parseCredits(s.current_month_spend),
                          );
                          const predictedDaily =
                            remaining / Math.max(1, daysBetween(today, end));
                          const actualDaily =
                            parseCredits(s.current_month_spend) /
                            Math.max(1, today.day);
                          const pct = (
                            ((actualDaily - predictedDaily) /
                              (predictedDaily || 1)) *
                            100
                          ).toFixed(1);
                          const direction =
                            actualDaily > predictedDaily ? 'over' : 'under';
                          return (
                            <li key={s.project_uuid} className="mb-1">
                              <a
                                href={`/projects/${s.project_uuid}/`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {s.project_name}
                              </a>
                              {translate(
                                ' — {percentage}% {direction} (actual {actual} vs {predicted} {currency}/day',
                                {
                                  direction,
                                  percentage: Math.abs(parseFloat(pct)).toFixed(
                                    1,
                                  ),
                                  actual: fmtCredits(actualDaily),
                                  predicted: fmtCredits(predictedDaily),
                                  currency: currencyName,
                                },
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </Tab>
              </Tabs>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ── Project filter dialog ────────────────────────────────────────── */}
      {dialogOpen && projects && (
        <ProjectFilterDialog
          projects={projects}
          selected={effectiveSelected}
          onConfirm={(next) => {
            setSelectedProjects(next);
            setDialogOpen(false);
          }}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </Container>
  );
};
