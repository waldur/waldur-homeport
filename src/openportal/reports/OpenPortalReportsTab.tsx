/**
 * Project-level OpenPortal usage report tab.
 *
 * Fetches usage and storage reports for the current project and renders them
 * using UsageReportVis / StorageReportVis.
 */

/* eslint-disable waldur-custom/no-direct-bootstrap-button */

import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import {
  CachedProjectStorageReport as StorageReportApiItem,
  CachedProjectUsageReport as UsageReportApiItem,
} from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { getProject } from '@/workspace/selectors';

import {
  fetchUsageReports,
  fetchStorageReports,
  fetchOfferingMapping,
  fetchUserMapping,
} from './api';
import {
  getCached,
  setCached,
  clearCached,
  clearMappingCache,
  getCacheAge,
  formatCacheAge,
  TTL,
} from './localStorageCache';
import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import { StorageReportVis } from './StorageReportVis';
import { NameMaps } from './usageChartOptions';
import { UsageReportVis } from './UsageReportVis';

const MAX_USER_MAPPINGS = 100;

/** Group reports by "year-month" so the user can select a specific month */
const groupByMonth = <T extends { year: number; month: number }>(
  items: T[],
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};
  for (const item of items) {
    const key = `${item.year}-${String(item.month).padStart(2, '0')}`;
    groups[key] = [...(groups[key] ?? []), item];
  }
  return groups;
};

export const OpenPortalReportsTab: FC = () => {
  const project = useSelector(getProject);

  const {
    data: usageReports,
    isLoading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['openportal-usage-reports', project?.uuid],
    queryFn: async () => {
      const cacheKey = `project-usage-${project!.uuid}`;
      const cached = getCached<UsageReportApiItem[]>(cacheKey, TTL.REPORTS);
      if (cached) return cached.map(ProjectUsageReport.fromApiResponse);
      const reports = await fetchUsageReports({ project_uuid: project!.uuid });
      setCached(
        cacheKey,
        reports.map((r) => r.apiItem),
      );
      return reports;
    },
    enabled: !!project,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const {
    data: storageReports,
    isLoading: storageLoading,
    error: storageError,
    refetch: refetchStorage,
  } = useQuery({
    queryKey: ['openportal-storage-reports', project?.uuid],
    queryFn: async () => {
      const cacheKey = `project-storage-${project!.uuid}`;
      const cached = getCached<StorageReportApiItem[]>(cacheKey, TTL.REPORTS);
      if (cached) return cached.map(ProjectStorageReport.fromApiResponse);
      const reports = await fetchStorageReports({
        project_uuid: project!.uuid,
      });
      setCached(
        cacheKey,
        reports.map((r) => r.apiItem),
      );
      return reports;
    },
    enabled: !!project,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const hasReports = !!(usageReports || storageReports);

  // ── Fetch name mappings once reports are available ───────────────────────
  const { data: nameMaps } = useQuery<NameMaps>({
    queryKey: ['openportal-project-mappings', project?.uuid],
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    queryFn: async () => {
      const usage = usageReports ?? [];
      const storage = storageReports ?? [];
      const offeringIds = [
        ...new Set<string>([
          ...usage.map((r) => r.resource),
          ...storage.map((r) => r.resource),
        ]),
      ];
      const allUserIds = [
        ...new Set<string>(usage.flatMap((r) => Object.keys(r.users))),
      ];
      const usageByUid: Record<string, number> = {};
      for (const r of usage) {
        for (const [uid, localName] of Object.entries(r.users)) {
          let sec = 0;
          for (const date of r.dates) {
            sec += r.getReport(date)?.usageForUser(localName)?.seconds ?? 0;
          }
          usageByUid[uid] = (usageByUid[uid] ?? 0) + sec;
        }
      }
      const userIds = allUserIds
        .filter((uid) => (usageByUid[uid] ?? 0) > 0)
        .sort((a, b) => (usageByUid[b] ?? 0) - (usageByUid[a] ?? 0))
        .slice(0, MAX_USER_MAPPINGS);
      const offerings = await fetchOfferingMapping(offeringIds);
      const users = await fetchUserMapping(userIds);
      const maps = {
        offering: Object.fromEntries(
          Object.entries(offerings).map(([k, v]) => [k, v.name]),
        ),
        user: Object.fromEntries(
          Object.entries(users).map(([k, v]) => [k, v.full_name]),
        ),
      } as NameMaps;
      return maps;
    },
    enabled: hasReports,
  });

  // Collect distinct resources across both report types
  const allResources = [
    ...new Set([
      ...(usageReports ?? []).map((r) => r.resource),
      ...(storageReports ?? []).map((r) => r.resource),
    ]),
  ].sort();

  const [selectedResource, setSelectedResource] = useState<string>('');
  const activeResource = allResources.includes(selectedResource)
    ? selectedResource
    : (allResources[0] ?? '');

  const usageForResource = (usageReports ?? []).filter(
    (r) => r.resource === activeResource,
  );
  const storageForResource = (storageReports ?? []).filter(
    (r) => r.resource === activeResource,
  );

  const usageByMonth = groupByMonth(usageForResource);
  const storageByMonth = groupByMonth(storageForResource);
  const allMonths = [
    ...new Set([...Object.keys(usageByMonth), ...Object.keys(storageByMonth)]),
  ]
    .sort()
    .reverse();

  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const activeMonth = selectedMonth;

  const activeUsage: ProjectUsageReport[] =
    activeMonth === 'all'
      ? usageForResource
      : (usageByMonth[activeMonth] ?? []);
  const activeStorage: ProjectStorageReport[] =
    activeMonth === 'all'
      ? storageForResource
      : (storageByMonth[activeMonth] ?? []);

  const isLoading = usageLoading || storageLoading;

  const reportsCacheAge =
    !isLoading && project ? getCacheAge(`project-usage-${project.uuid}`) : null;

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center gap-3 mb-4">
        <h4 className="mb-0">{translate('Usage Report')}</h4>

        {/* Resource / destination picker */}
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

        {/* Month picker */}
        {allMonths.length > 0 && (
          <Form.Select
            size="sm"
            style={{ width: 'auto' }}
            value={activeMonth}
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
          {reportsCacheAge && (
            <span className="text-muted small">
              {translate('Cached {age}', {
                age: formatCacheAge(reportsCacheAge),
              })}
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              clearMappingCache();
              if (project) {
                clearCached(
                  `project-usage-${project.uuid}`,
                  `project-storage-${project.uuid}`,
                );
              }
              refetchUsage();
              refetchStorage();
            }}
          >
            {translate('Refresh')}
          </Button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      {usageError && (
        <LoadingErred
          message={translate('Failed to load usage reports')}
          loadData={refetchUsage}
        />
      )}

      {storageError && (
        <LoadingErred
          message={translate('Failed to load storage reports')}
          loadData={refetchStorage}
        />
      )}

      {!isLoading && !usageError && !storageError && allMonths.length === 0 && (
        <div className="text-muted py-4 text-center">
          {translate('No OpenPortal reports found for this project.')}
        </div>
      )}

      {/* Usage chart */}
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

      {/* Storage chart */}
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
