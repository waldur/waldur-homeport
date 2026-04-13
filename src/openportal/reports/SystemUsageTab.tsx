/**
 * System-wide OpenPortal usage and storage tab for staff / support users.
 */
/* eslint-disable no-console */
/* eslint-disable waldur-custom/no-direct-bootstrap-button */

import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Container, Form } from 'react-bootstrap';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { translate } from '@waldur/i18n';

import {
  fetchOfferingMapping,
  fetchProjectMapping,
  fetchStorageReports,
  fetchUsageReports,
  fetchUserMapping,
  mappingBatchCount,
} from './api';
import { clearMappingCache } from './localStorageCache';
import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import {
  groupByMonth,
  MAX_USER_MAPPINGS,
  ReportPreFilters,
} from './ReportPreFilters';
import { StageProgress } from './StageProgress';
import { StorageReportVis } from './StorageReportVis';
import { NameMaps } from './usageChartOptions';
import { UsageReportVis } from './UsageReportVis';

export const SystemUsageTab: FC = () => {
  const [loadTriggered, setLoadTriggered] = useState(false);
  const [showLoadPrompt, setShowLoadPrompt] = useState(true);
  const [loadAllUserMappings, setLoadAllUserMappings] = useState(false);
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // ── Pre-filter: year / month ─────────────────────────────────────────────
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);

  // ── Stage 2: Fetch all reports system-wide ──────────────────────────────
  // (No project list for system tab — reports fetched directly)
  const [usageProgress, setUsageProgress] = useState({ page: 0, total: 0 });
  const [storageProgress, setStorageProgress] = useState({ page: 0, total: 0 });
  // 'idle' | 'usage' | 'storage' | 'done'
  const [fetchPhase, setFetchPhase] = useState<
    'idle' | 'usage' | 'storage' | 'done'
  >('idle');

  const {
    data: reportData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: ['openportal-system-reports', filterYear, filterMonth],
    queryFn: async () => {
      setUsageProgress({ page: 0, total: 0 });
      setStorageProgress({ page: 0, total: 0 });
      setFetchPhase('usage');
      const usage = await fetchUsageReports(
        { year: filterYear, month: filterMonth },
        (page, totalPages) =>
          setUsageProgress({ page, total: totalPages ?? 0 }),
      );
      setFetchPhase('storage');
      const storage = await fetchStorageReports(
        { year: filterYear, month: filterMonth },
        (page, totalPages) =>
          setStorageProgress({ page, total: totalPages ?? 0 }),
      );
      setFetchPhase('done');
      return { usage, storage };
    },
    enabled: loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

  // ── Stage 4: Fetch name mappings ─────────────────────────────────────────
  const [mappingsProgress, setMappingsProgress] = useState({
    done: 0,
    total: 0,
    statusMsg: '',
  });
  const [mapsResult, setMapsResult] = useState<
    { maps: NameMaps; truncatedUserCount: number } | undefined
  >(undefined);
  const [mappingsLoading, setMappingsLoading] = useState(false);

  useEffect(() => {
    if (!reportData) {
      setMapsResult(undefined);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setMapsResult(undefined);
      setMappingsLoading(true);
      setMappingsProgress({ done: 0, total: 0, statusMsg: '' });
      try {
        const usageReports = reportData.usage;
        const storageReports = reportData.storage;
        const offeringIds = [
          ...new Set<string>([
            ...usageReports.map((r) => r.resource),
            ...storageReports.map((r) => r.resource),
          ]),
        ];
        const projectIds = [
          ...new Set<string>([
            ...usageReports.map((r) => r.project),
            ...storageReports.map((r) => r.project),
          ]),
        ];
        const allUserIds = [
          ...new Set<string>(usageReports.flatMap((r) => Object.keys(r.users))),
        ];
        const usageByUid: Record<string, number> = {};
        for (const r of usageReports) {
          for (const [uid, localName] of Object.entries(r.users)) {
            let sec = 0;
            for (const date of r.dates) {
              sec += r.getReport(date)?.usageForUser(localName)?.seconds ?? 0;
            }
            usageByUid[uid] = (usageByUid[uid] ?? 0) + sec;
          }
        }
        const usersWithUsage = allUserIds
          .filter((uid) => (usageByUid[uid] ?? 0) > 0)
          .sort((a, b) => (usageByUid[b] ?? 0) - (usageByUid[a] ?? 0));
        const userIds = loadAllUserMappings
          ? usersWithUsage
          : usersWithUsage.slice(0, MAX_USER_MAPPINGS);
        const truncatedUserCount =
          !loadAllUserMappings && usersWithUsage.length > MAX_USER_MAPPINGS
            ? usersWithUsage.length - MAX_USER_MAPPINGS
            : 0;

        const ob = mappingBatchCount(offeringIds);
        const pb = mappingBatchCount(projectIds);
        const ub = mappingBatchCount(userIds);
        const total = ob + pb + ub;

        console.debug('[OpenPortal system] mappings start:', {
          offerings: offeringIds.length,
          projects: projectIds.length,
          users: userIds.length,
          total,
        });
        setMappingsProgress({
          done: 0,
          total,
          statusMsg: translate('Offering names…'),
        });

        const offerings = await fetchOfferingMapping(offeringIds, (done) => {
          if (cancelled) return;
          setMappingsProgress({
            done,
            total,
            statusMsg: translate('Offering names — {done} of {total}', {
              done,
              total: ob,
            }),
          });
        });
        if (cancelled) return;
        setMappingsProgress({
          done: ob,
          total,
          statusMsg: translate('Project names…'),
        });

        const projMaps = await fetchProjectMapping(projectIds, (done) => {
          if (cancelled) return;
          setMappingsProgress({
            done: ob + done,
            total,
            statusMsg: translate('Project names — {done} of {total}', {
              done,
              total: pb,
            }),
          });
        });
        if (cancelled) return;
        setMappingsProgress({
          done: ob + pb,
          total,
          statusMsg: translate('User names…'),
        });

        const users = await fetchUserMapping(userIds, (done) => {
          if (cancelled) return;
          setMappingsProgress({
            done: ob + pb + done,
            total,
            statusMsg: translate('User names — {done} of {total}', {
              done,
              total: ub,
            }),
          });
        });
        if (cancelled) return;

        console.debug('[OpenPortal system] mappings done:', {
          offerings: Object.keys(offerings).length,
          projects: Object.keys(projMaps).length,
          users: Object.keys(users).length,
        });

        const maps = {
          offering: Object.fromEntries(
            Object.entries(offerings)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, v.name]),
          ),
          project: Object.fromEntries(
            Object.entries(projMaps)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, v.name]),
          ),
          user: Object.fromEntries(
            Object.entries(users)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, v.full_name]),
          ),
        } as NameMaps;
        setMapsResult({ maps, truncatedUserCount });
      } catch (err) {
        console.error('[OpenPortal system] mapping error:', err);
      } finally {
        if (!cancelled) setMappingsLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [reportData, loadAllUserMappings]);

  const nameMaps = mapsResult?.maps;
  const usersTruncatedCount = mapsResult?.truncatedUserCount ?? 0;

  // ── Resource filter ──────────────────────────────────────────────────────
  const allResources = useMemo(
    () =>
      [
        ...new Set([
          ...allUsage.map((r) => r.resource),
          ...allStorage.map((r) => r.resource),
        ]),
      ].sort(),
    [allUsage, allStorage],
  );

  const [selectedResource, setSelectedResource] = useState('');
  const activeResource = allResources.includes(selectedResource)
    ? selectedResource
    : (allResources[0] ?? '');

  const usageForResource = allUsage.filter(
    (r) => r.resource === activeResource,
  );
  const storageForResource = allStorage.filter(
    (r) => r.resource === activeResource,
  );

  // ── Month filter ─────────────────────────────────────────────────────────
  const usageByMonthMap = groupByMonth(usageForResource);
  const storageByMonthMap = groupByMonth(storageForResource);
  const allMonths = [
    ...new Set([
      ...Object.keys(usageByMonthMap),
      ...Object.keys(storageByMonthMap),
    ]),
  ]
    .sort()
    .reverse();

  const [selectedMonth, setSelectedMonth] = useState('all');

  const activeUsage: ProjectUsageReport[] =
    selectedMonth === 'all'
      ? usageForResource
      : (usageByMonthMap[selectedMonth] ?? []);
  const activeStorage: ProjectStorageReport[] =
    selectedMonth === 'all'
      ? storageForResource
      : (storageByMonthMap[selectedMonth] ?? []);

  // ── Current loading stage ────────────────────────────────────────────────
  const loadingStage = reportsLoading ? 2 : mappingsLoading ? 4 : 0;

  // ── Slow-load warning ────────────────────────────────────────────────────
  useEffect(() => {
    const isLoading = reportsLoading || loadingStage === 4;
    if (!isLoading) {
      setShowSlowWarning(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowWarning(true), 5000);
    return () => clearTimeout(timer);
  }, [reportsLoading, loadingStage]);

  return (
    <Container fluid className="py-4">
      {/* ── Toolbar ────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-3 mb-4 flex-wrap">
        <h4 className="mb-0">{translate('System Usage Report')}</h4>

        {allResources.length > 1 && (
          <Form.Select
            size="sm"
            style={{ width: 'auto' }}
            value={activeResource}
            onChange={(e) => {
              setSelectedResource(e.target.value);
              setSelectedMonth('all');
            }}
          >
            {allResources.map((r) => (
              <option key={r} value={r}>
                {nameMaps?.offering?.[r] ?? r}
              </option>
            ))}
          </Form.Select>
        )}

        {allMonths.length > 0 && (
          <Form.Select
            size="sm"
            style={{ width: 'auto' }}
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">{translate('All time')}</option>
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Form.Select>
        )}

        <div className="ms-auto d-flex align-items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              clearMappingCache();
              refetchReports();
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
      </div>

      {/* ── Load prompt ─────────────────────────────────────────────────── */}
      {showLoadPrompt && !loadTriggered && (
        <Card className="mb-4">
          <Card.Body>
            <p className="mb-2 fw-semibold">
              {translate('System usage data not yet loaded')}
            </p>

            {/* Year / Month pre-filters */}
            <ReportPreFilters
              year={filterYear}
              month={filterMonth}
              onYearChange={setFilterYear}
              onMonthChange={setFilterMonth}
            />

            <p className="text-muted small mb-3">
              {translate(
                'Fetches all OpenPortal usage and storage reports across every project in the system. Filtering to a specific year or month will be much faster.',
              )}
            </p>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setLoadTriggered(true);
                setShowLoadPrompt(false);
              }}
            >
              {translate('Load reports')}
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* ── Progress bars ───────────────────────────────────────────────── */}
      {loadingStage === 2 && fetchPhase === 'usage' && (
        <StageProgress
          stage={2}
          total={4}
          label={translate('Downloading usage reports')}
          done={usageProgress.page}
          max={usageProgress.total}
          statusMsg={
            usageProgress.total > 0
              ? translate('Page {page} of {total}', {
                  page: usageProgress.page,
                  total: usageProgress.total,
                })
              : usageProgress.page > 0
                ? translate('Page {page}…', { page: usageProgress.page })
                : undefined
          }
        />
      )}
      {loadingStage === 2 && fetchPhase === 'storage' && (
        <StageProgress
          stage={3}
          total={4}
          label={translate('Downloading storage reports')}
          done={storageProgress.page}
          max={storageProgress.total}
          statusMsg={
            storageProgress.total > 0
              ? translate('Page {page} of {total}', {
                  page: storageProgress.page,
                  total: storageProgress.total,
                })
              : storageProgress.page > 0
                ? translate('Page {page}…', { page: storageProgress.page })
                : undefined
          }
        />
      )}
      {loadingStage === 4 && (
        <StageProgress
          stage={4}
          total={4}
          label={translate('Loading name mappings')}
          done={mappingsProgress.done}
          max={mappingsProgress.total}
          statusMsg={mappingsProgress.statusMsg || undefined}
        />
      )}

      {/* ── Slow-load warning ───────────────────────────────────────────── */}
      {showSlowWarning && (
        <Alert
          variant="warning"
          className="d-flex align-items-start gap-3 mb-3"
        >
          <div className="flex-grow-1">
            <strong>{translate('This is taking a while.')}</strong>
            <div className="small mt-1">
              {translate(
                'To speed things up: select a specific year and month filter before loading. System-wide data across all projects and users can be very large.',
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

      {/* ── Errors ─────────────────────────────────────────────────────── */}
      {reportsError && (
        <LoadingErred
          message={translate('Failed to load system usage reports')}
          loadData={refetchReports}
        />
      )}

      {loadTriggered &&
        !reportsLoading &&
        !reportsError &&
        allUsage.length === 0 &&
        allStorage.length === 0 && (
          <p className="text-muted">
            {translate('No OpenPortal reports found.')}
          </p>
        )}

      {/* ── User mapping truncation notice ──────────────────────────────── */}
      {usersTruncatedCount > 0 && nameMaps !== undefined && (
        <Alert
          variant="info"
          className="d-flex align-items-center gap-2 mb-3 py-2"
        >
          <small>
            {translate(
              'User names shown for top {max} users by usage only. {count} more {user} not mapped.',
              {
                max: MAX_USER_MAPPINGS,
                count: usersTruncatedCount,
                user:
                  usersTruncatedCount !== 1
                    ? translate('users')
                    : translate('user'),
              },
            )}
          </small>
          <Button
            variant="tertiary"
            size="sm"
            className="ms-auto"
            onClick={() => setLoadAllUserMappings(true)}
          >
            {translate('Load all user names')}
          </Button>
        </Alert>
      )}

      {/* ── Charts ────────────────────────────────────────────────────── */}
      {activeUsage.length > 0 && nameMaps !== undefined && (
        <Card className="mb-4">
          <Card.Header className="fw-semibold">
            {translate('Usage')}
          </Card.Header>
          <Card.Body>
            <UsageReportVis
              reports={activeUsage}
              height="400px"
              nameMaps={nameMaps}
            />
          </Card.Body>
        </Card>
      )}

      {activeStorage.length > 0 && nameMaps !== undefined && (
        <Card className="mb-4">
          <Card.Header className="fw-semibold">
            {translate('Storage')}
          </Card.Header>
          <Card.Body>
            <StorageReportVis
              reports={activeStorage}
              height="360px"
              nameMaps={nameMaps}
            />
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};
