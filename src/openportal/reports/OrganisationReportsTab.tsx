/**
 * Organisation-level OpenPortal reports tab.
 */

/* eslint-disable no-console */
import { useQuery } from '@tanstack/react-query';
import classNames from 'classnames';
import { ChangeEvent, FC, useEffect, useMemo, useState } from 'react';
import { Card } from 'react-bootstrap';
import { projectsList } from 'waldur-js-client';

import {
  AlertItem,
  Badge,
  BaseButton,
  Checkbox,
  DatePicker,
  DateRangePicker,
  FormField,
  FormLabel,
  NativeSelect,
  parseDateValue,
  toIsoDate,
} from 'waldur-ui';

import { getNextPageUrl } from '@/core/api';
import { LoadingErred } from '@/core/LoadingErred';
import { BaseInputField } from '@/form/InputField';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { PAGE_CONTAINER_CLASSNAME } from '@/navigation/pageContainer';
import { useCustomer } from '@/workspace/hooks';

import {
  fetchOfferingMapping,
  fetchProjectMapping,
  fetchStorageReports,
  fetchUsageReports,
  fetchUserMapping,
  mappingBatchCount,
} from './api';
import type { OpenPortalProject } from './api';
import {
  clearCached,
  clearMappingCache,
  formatCacheAge,
  getCacheAge,
  getCached,
  setCached,
  TTL,
} from './localStorageCache';
import { ProjectStorageReport } from './ProjectStorageReport';
import {
  DailyProjectUsageReport,
  ProjectUsageReport,
} from './ProjectUsageReport';
import {
  groupByMonth,
  MAX_USER_MAPPINGS,
  MONTH_NAMES,
  ReportPreFilters,
} from './ReportPreFilters';
import { StageProgress } from './StageProgress';
import { StorageReportVis } from './StorageReportVis';
import { NameMaps } from './usageChartOptions';
import { UsageReportVis } from './UsageReportVis';

// ── Helpers ───────────────────────────────────────────────────────────────────

interface ProjectAutocompleteDialogProps {
  projects: OpenPortalProject[];
  selected: Set<string>;
  onConfirm: (next: Set<string>) => void;
}

const ProjectAutocompleteDialog: FC<{
  resolve: ProjectAutocompleteDialogProps;
}> = ({ resolve: { projects, selected, onConfirm } }) => {
  const { closeDialog } = useModal();
  const onClose = () => closeDialog();
  const [draft, setDraft] = useState(() => new Set(selected));
  const [nameFilter, setNameFilter] = useState('');
  const [startAfter, setStartAfter] = useState('');
  const [endBefore, setEndBefore] = useState('');
  const [showFinished, setShowFinished] = useState(true);
  const [showInGrace, setShowInGrace] = useState(true);

  const visible = useMemo(() => {
    return projects.filter((p) => {
      if (
        nameFilter &&
        !p.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
        return false;
      if (startAfter && p.start_date && p.start_date < startAfter) return false;
      if (endBefore && p.end_date && p.end_date > endBefore) return false;
      if (!showFinished && p.is_expired && !p.is_in_grace_period) return false;
      if (!showInGrace && p.is_in_grace_period) return false;
      return true;
    });
  }, [projects, nameFilter, startAfter, endBefore, showFinished, showInGrace]);

  const allVisibleSelected = visible.every((p) => draft.has(p.uuid));

  const toggleAll = () => {
    const next = new Set(draft);
    if (allVisibleSelected) {
      visible.forEach((p) => next.delete(p.uuid));
    } else {
      visible.forEach((p) => next.add(p.uuid));
    }
    setDraft(next);
  };

  const toggle = (uuid: string) => {
    const next = new Set(draft);
    if (next.has(uuid)) next.delete(uuid);
    else next.add(uuid);
    setDraft(next);
  };

  return (
    <ModalDialog
      title={translate('Select projects')}
      footer={
        <>
          <BaseButton
            variant="secondary"
            size="sm"
            onClick={onClose}
            label={translate('Cancel')}
          />
          <BaseButton
            variant="primary"
            size="sm"
            onClick={() => {
              onConfirm(draft);
              onClose();
            }}
            label={translate('Apply ({count} {project})', {
              count: draft.size,
              project:
                draft.size !== 1 ? translate('projects') : translate('project'),
            })}
          />
        </>
      }
    >
      <div className="grid grid-cols-12 gap-1.5 mb-2.5">
        <div className="col-span-12 md:col-span-4">
          <FormField>
            <FormLabel className="small mb-1">{translate('Search')}</FormLabel>
            <BaseInputField
              type="text"
              size="sm"
              placeholder={translate('Filter by name…')}
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </FormField>
        </div>
        <div className="col-span-6 md:col-span-4">
          <FormField>
            <FormLabel className="small mb-1">
              {translate('Start date — after')}
            </FormLabel>
            <DatePicker
              size="sm"
              value={parseDateValue(startAfter)}
              onChange={(date) => setStartAfter(toIsoDate(date))}
            />
          </FormField>
        </div>
        <div className="col-span-6 md:col-span-4">
          <FormField>
            <FormLabel className="small mb-1">
              {translate('End date — before')}
            </FormLabel>
            <DatePicker
              size="sm"
              value={parseDateValue(endBefore)}
              onChange={(date) => setEndBefore(toIsoDate(date))}
            />
          </FormField>
        </div>
      </div>
      <div className="flex items-center gap-3 mb-2.5 flex-wrap">
        <Checkbox
          id="dlg-showFinished"
          checked={showFinished}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setShowFinished(e.target.checked)
          }
          className="mb-0"
          label={translate('Finished')}
        />
        <Checkbox
          id="dlg-showInGrace"
          checked={showInGrace}
          disabled={!showFinished}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setShowInGrace(e.target.checked)
          }
          className="mb-0"
          label={translate('In grace period')}
        />
      </div>

      <div className="flex items-center gap-1.5 mb-1.5">
        <Checkbox
          id="select-all-visible"
          checked={allVisibleSelected && visible.length > 0}
          onChange={toggleAll}
          label={translate('{select} all visible ({count})', {
            select: allVisibleSelected
              ? translate('Deselect')
              : translate('Select'),
            count: visible.length,
          })}
        />
        <span className="ms-auto text-quaternary small">
          {translate('{count} of {total} selected', {
            count: draft.size,
            total: projects.length,
          })}
        </span>
      </div>
      <div
        style={{ maxHeight: 320, overflowY: 'auto' }}
        className="border rounded p-1.5"
      >
        {visible.length === 0 && (
          <p className="text-quaternary small mb-0 p-1.5">
            {translate('No projects match the filters.')}
          </p>
        )}
        {visible.map((p) => (
          <div key={p.uuid} className="flex items-start gap-1.5 py-1">
            <Checkbox
              id={`proj-${p.uuid}`}
              checked={draft.has(p.uuid)}
              onChange={() => toggle(p.uuid)}
              className="mt-1"
              label={
                <span className="grow" style={{ cursor: 'pointer' }}>
                  <span>{p.name}</span>
                  {(p.start_date || p.end_date) && (
                    <span className="text-quaternary small ms-1.5">
                      {p.start_date ?? '?'} →{' '}
                      {p.end_date ?? translate('ongoing')}
                    </span>
                  )}
                  {p.is_in_grace_period && (
                    <Badge
                      variant="warning"
                      size="sm"
                      tone="outline"
                      className="ms-1.5"
                    >
                      {translate('In grace')}
                    </Badge>
                  )}
                  {p.is_expired && !p.is_in_grace_period && (
                    <Badge
                      variant="neutral"
                      size="sm"
                      tone="outline"
                      className="ms-1.5"
                    >
                      {translate('Finished')}
                    </Badge>
                  )}
                </span>
              }
            />
          </div>
        ))}
      </div>
    </ModalDialog>
  );
};

// ── Main tab ──────────────────────────────────────────────────────────────────

export const OrganisationReportsTab: FC = () => {
  const customer = useCustomer();
  const [loadTriggered, setLoadTriggered] = useState(false);
  const [showLoadPrompt, setShowLoadPrompt] = useState(true);

  // ── Pre-filter: year / month ─────────────────────────────────────────────
  const [filterYear, setFilterYear] = useState<number | undefined>(undefined);
  const [filterMonth, setFilterMonth] = useState<number | undefined>(undefined);

  // ── Pre-filter: project search / date range ──────────────────────────────
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStartAfter, setProjectStartAfter] = useState('');
  const [projectEndBefore, setProjectEndBefore] = useState('');

  // ── Pre-filter: project status checkboxes ────────────────────────────────
  const [includeFinished, setIncludeFinished] = useState(true);
  const [includeInGrace, setIncludeInGrace] = useState(true);

  // ── User mapping: load-all toggle ────────────────────────────────────────
  const [loadAllUserMappings, setLoadAllUserMappings] = useState(false);

  // ── Slow-load warning ────────────────────────────────────────────────────
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  // ── Stage 1: Fetch all projects ──────────────────────────────────────────
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
      'openportal-org-projects',
      customer?.uuid,
      projectSearch,
      projectStartAfter,
      projectEndBefore,
      filterYear,
      filterMonth,
      includeFinished,
      includeInGrace,
      'terminated',
    ],
    queryFn: async () => {
      const activeDuring = filterYear
        ? filterMonth
          ? `${filterYear}-${String(filterMonth).padStart(2, '0')}`
          : String(filterYear)
        : '';
      const cacheKey = `org-projects-${customer!.uuid}-${projectSearch}-${projectStartAfter}-${projectEndBefore}-${activeDuring}-${includeFinished}-${includeInGrace}-include_terminated`;
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
            ...(activeDuring ? { active_during: activeDuring } : {}),
            ...(!includeFinished ? { ended: false } : {}),
            ...(includeFinished && !includeInGrace ? { in_grace: false } : {}),
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

  // ── Project selection state ──────────────────────────────────────────────
  const allProjectUuids = useMemo(
    () => new Set((projects ?? []).map((p) => p.uuid)),
    [projects],
  );
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(
    new Set(),
  );
  const { openDialog } = useModal();
  const effectiveSelected =
    selectedProjects.size > 0 ? selectedProjects : allProjectUuids;
  const selectedUuids = useMemo(
    () => [...effectiveSelected],
    [effectiveSelected],
  );

  const projectsCacheAge =
    !projectsLoading && customer
      ? getCacheAge(`org-projects-${customer.uuid}`)
      : null;

  // ── Stage 2: Fetch reports ───────────────────────────────────────────────
  const [fetchProgress, setFetchProgress] = useState({ done: 0, total: 0 });

  const {
    data: reportData,
    isLoading: reportsLoading,
    error: reportsError,
    refetch: refetchReports,
  } = useQuery({
    queryKey: [
      'openportal-org-reports',
      customer?.uuid,
      selectedUuids,
      filterYear,
      filterMonth,
    ],
    queryFn: async () => {
      setFetchProgress({ done: 0, total: selectedUuids.length });
      const results = await Promise.all(
        selectedUuids.map(async (uuid) => {
          const [usage, storage] = await Promise.all([
            fetchUsageReports({
              project_uuid: uuid,
              year: filterYear,
              month: filterMonth,
            }),
            fetchStorageReports({
              project_uuid: uuid,
              year: filterYear,
              month: filterMonth,
            }),
          ]);
          setFetchProgress((prev) => ({ ...prev, done: prev.done + 1 }));
          return [usage, storage] as const;
        }),
      );
      return {
        usage: results.flatMap(([u]) => u),
        storage: results.flatMap(([, s]) => s),
      };
    },
    enabled: selectedUuids.length > 0 && loadTriggered,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
  });

  const allUsage = reportData?.usage ?? [];
  const allStorage = reportData?.storage ?? [];

  // ── Stage 3: Fetch name mappings ─────────────────────────────────────────
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
          ...new Set([
            ...usageReports.map((r) => r.resource),
            ...storageReports.map((r) => r.resource),
          ]),
        ];
        const projectIds = [
          ...new Set([
            ...usageReports.map((r) => r.project),
            ...storageReports.map((r) => r.project),
          ]),
        ];

        // Top users by usage, capped at MAX_USER_MAPPINGS
        // For each uid, determine the lookup identifier for the mapping API:
        // if the users value contains '@' it is an email (remote report) — use the email;
        // otherwise it is a unix username (local report) — use the UserIdentifier (key).
        const uidToLookupId: Record<string, string> = {};
        for (const r of usageReports) {
          for (const [uid, localOrEmail] of Object.entries(r.users) as [
            string,
            string,
          ][]) {
            uidToLookupId[uid] = localOrEmail.includes('@')
              ? localOrEmail
              : uid;
          }
        }
        // Reverse map so we can key nameMaps.user by UserIdentifier after the fetch.
        const lookupIdToUid: Record<string, string> = Object.fromEntries(
          Object.entries(uidToLookupId).map(([uid, lookupId]) => [
            lookupId,
            uid,
          ]),
        );

        const allUserIds = Object.keys(uidToLookupId);
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
        const userIdsCapped = loadAllUserMappings
          ? usersWithUsage
          : usersWithUsage.slice(0, MAX_USER_MAPPINGS);
        const usersMappingsTruncated =
          !loadAllUserMappings && usersWithUsage.length > MAX_USER_MAPPINGS;
        const lookupIdsCapped = userIdsCapped.map(
          (uid) => uidToLookupId[uid] ?? uid,
        );

        // Find email identifiers that appear in daily reports but have no entry in
        // report.users (i.e. no UserIdentifier maps to them). These are unmapped
        // remote users — we can still look them up by email and store the result
        // keyed by email in nameMaps.user.
        const mappedLocalIds = new Set<string>(
          usageReports.flatMap(
            (r: ProjectUsageReport) => Object.values(r.users) as string[],
          ),
        );
        const unmappedEmailIds = [
          ...new Set<string>(
            usageReports.flatMap((r: ProjectUsageReport) =>
              r
                .localUsers()
                .filter(
                  (u: string) => !mappedLocalIds.has(u) && u.includes('@'),
                ),
            ),
          ),
        ];
        const allLookupIds = [...lookupIdsCapped, ...unmappedEmailIds];

        const ob = mappingBatchCount(offeringIds);
        const pb = mappingBatchCount(projectIds);
        const ub = mappingBatchCount(allLookupIds);
        const total = ob + pb + ub;
        let cum = 0;

        console.debug('[OpenPortal org] mappings start:', {
          offerings: offeringIds.length,
          projects: projectIds.length,
          users: allLookupIds.length,
          total,
        });
        setMappingsProgress({
          done: 0,
          total,
          statusMsg: translate('Offering names…'),
        });

        const offerings = await fetchOfferingMapping(offeringIds, (done) => {
          if (cancelled) return;
          cum = done;
          setMappingsProgress({
            done: cum,
            total,
            statusMsg: translate('Offering names — {done} of {total}', {
              done,
              total: ob,
            }),
          });
        });
        if (cancelled) return;
        cum = ob;
        setMappingsProgress({
          done: cum,
          total,
          statusMsg: translate('Project names…'),
        });

        const projMaps = await fetchProjectMapping(projectIds, (done) => {
          if (cancelled) return;
          cum = ob + done;
          setMappingsProgress({
            done: cum,
            total,
            statusMsg: translate('Project names — {done} of {total}', {
              done,
              total: pb,
            }),
          });
        });
        if (cancelled) return;
        cum = ob + pb;
        setMappingsProgress({
          done: cum,
          total,
          statusMsg: translate('User names…'),
        });

        const users = await fetchUserMapping(allLookupIds, (done) => {
          if (cancelled) return;
          cum = ob + pb + done;
          setMappingsProgress({
            done: cum,
            total,
            statusMsg: translate('User names — {done} of {total}', {
              done,
              total: ub,
            }),
          });
        });
        if (cancelled) return;

        console.debug('[OpenPortal org] mappings done:', {
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
              .map(([k, v]) => [lookupIdToUid[k] ?? k, v.full_name]),
          ),
        } as NameMaps;
        setMapsResult({
          maps,
          truncatedUserCount: usersMappingsTruncated
            ? usersWithUsage.length - MAX_USER_MAPPINGS
            : 0,
        });
      } catch (err) {
        console.error('[OpenPortal org] mapping error:', err);
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
  const resourceConsumption = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const r of allUsage) {
      const sec = r
        .dailyReports()
        .reduce(
          (sum: number, d: DailyProjectUsageReport) =>
            sum + d.totalUsage().seconds,
          0,
        );
      totals[r.resource] = (totals[r.resource] ?? 0) + sec;
    }
    return totals;
  }, [allUsage]);

  const allResources = useMemo(
    () =>
      [
        ...new Set([
          ...allUsage.map((r) => r.resource),
          ...allStorage.map((r) => r.resource),
        ]),
      ]
        .filter((resource) => (resourceConsumption[resource] ?? 0) > 0)
        .sort(
          (a, b) =>
            (resourceConsumption[b] ?? 0) - (resourceConsumption[a] ?? 0),
        ),
    [allUsage, allStorage, resourceConsumption],
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
  const usageByMonth = groupByMonth(usageForResource);
  const storageByMonth = groupByMonth(storageForResource);
  const allMonths = [
    ...new Set([...Object.keys(usageByMonth), ...Object.keys(storageByMonth)]),
  ]
    .sort()
    .reverse();

  const [selectedMonth, setSelectedMonth] = useState('all');

  const activeUsage: ProjectUsageReport[] =
    selectedMonth === 'all'
      ? usageForResource
      : (usageByMonth[selectedMonth] ?? []);
  const activeStorage: ProjectStorageReport[] =
    selectedMonth === 'all'
      ? storageForResource
      : (storageByMonth[selectedMonth] ?? []);

  // ── Current loading stage ────────────────────────────────────────────────
  const loadingStage = projectsLoading
    ? 1
    : reportsLoading
      ? 2
      : mappingsLoading
        ? 3
        : 0;

  // ── Slow-load warning timer ──────────────────────────────────────────────
  useEffect(() => {
    const isLoading = projectsLoading || reportsLoading || loadingStage === 3;
    if (!isLoading) {
      setShowSlowWarning(false);
      return;
    }
    const timer = setTimeout(() => setShowSlowWarning(true), 5000);
    return () => clearTimeout(timer);
  }, [projectsLoading, reportsLoading, loadingStage]);

  return (
    <div className={classNames(PAGE_CONTAINER_CLASSNAME, 'py-3')}>
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 mb-3 flex-wrap">
        <h4 className="mb-0">{translate('Usage Report')}</h4>

        {projects && projects.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-quaternary small">
              {translate('{count} of {total} {project} selected', {
                count: effectiveSelected.size,
                total: projects.length,
                project:
                  projects.length !== 1
                    ? translate('projects')
                    : translate('project'),
              })}
            </span>
            <BaseButton
              variant="primary"
              size="sm"
              onClick={() =>
                projects &&
                openDialog(ProjectAutocompleteDialog, {
                  size: 'lg',
                  resolve: {
                    projects,
                    selected: effectiveSelected,
                    onConfirm: (next) => {
                      setSelectedProjects(next);
                      setSelectedMonth('all');
                    },
                  },
                })
              }
              label={translate('Filter selected projects')}
            />
          </div>
        )}

        {allResources.length > 1 && (
          <NativeSelect
            size="sm"
            fit
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
          </NativeSelect>
        )}

        {allMonths.length > 0 && (
          <NativeSelect
            size="sm"
            fit
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="all">{translate('All time')}</option>
            {allMonths.map((m) => {
              const [y, mo] = m.split('-');
              return (
                <option key={m} value={m}>
                  {MONTH_NAMES[parseInt(mo, 10) - 1]} {y}
                </option>
              );
            })}
          </NativeSelect>
        )}

        {loadTriggered && (
          <div className="ms-auto flex items-center gap-1.5">
            {projectsCacheAge && (
              <span className="text-quaternary small">
                {translate('Cached {age}', {
                  age: formatCacheAge(projectsCacheAge),
                })}
              </span>
            )}
            <BaseButton
              variant="secondary"
              size="sm"
              onClick={() => {
                clearMappingCache();
                if (customer) {
                  clearCached(`org-projects-${customer.uuid}`);
                }
                refetchProjects();
                if (loadTriggered) refetchReports();
              }}
              label={translate('Refresh')}
            />
            <BaseButton
              variant="secondary"
              size="sm"
              onClick={() => setShowLoadPrompt(true)}
              label={translate('Load new data…')}
            />
          </div>
        )}
      </div>

      {/* ── Load prompt ──────────────────────────────────────────────── */}
      {showLoadPrompt && !projectsLoading && !reportsLoading && (
        <Card className="mb-3">
          <Card.Body>
            <p className="mb-1.5">
              {translate('Usage reports not yet loaded')}
            </p>

            {/* Project pre-filters */}
            <div className="grid grid-cols-1 gap-1.5 mb-2.5 md:grid-cols-3">
              <div>
                <FormField>
                  <FormLabel className="small mb-1">
                    {translate('Project search')}
                  </FormLabel>
                  <BaseInputField
                    type="text"
                    placeholder={translate(
                      'Name search (applied at load time)…',
                    )}
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                  />
                </FormField>
              </div>
              <div>
                <FormField>
                  <FormLabel className="small mb-1">
                    {translate('Project period')}
                  </FormLabel>
                  <DateRangePicker
                    value={
                      projectStartAfter && projectEndBefore
                        ? [
                            parseDateValue(projectStartAfter)!,
                            parseDateValue(projectEndBefore)!,
                          ]
                        : undefined
                    }
                    onChange={(range) => {
                      setProjectStartAfter(range ? toIsoDate(range[0]) : '');
                      setProjectEndBefore(range ? toIsoDate(range[1]) : '');
                    }}
                    clearable
                  />
                </FormField>
              </div>
            </div>

            {/* Project status checkboxes */}
            <div className="flex items-center gap-3 mb-2.5 flex-wrap">
              <Checkbox
                id="includeFinished"
                checked={includeFinished}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIncludeFinished(e.target.checked)
                }
                className="mb-0"
                label={translate('Finished')}
              />
              <Checkbox
                id="includeInGrace"
                checked={includeInGrace}
                disabled={!includeFinished}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setIncludeInGrace(e.target.checked)
                }
                className="mb-0"
                label={translate('In grace period')}
              />
            </div>

            <ReportPreFilters
              year={filterYear}
              month={filterMonth}
              onYearChange={setFilterYear}
              onMonthChange={setFilterMonth}
            />

            <p className="text-quaternary small mb-2.5">
              {translate(
                'Fetches reports for each project in parallel — this may take 15–30 seconds for large organizations. Tip: selecting a year or month limits projects to those active during that period, which is usually the fastest way to narrow the load for large organizations.',
              )}
            </p>

            <BaseButton
              variant="primary"
              size="sm"
              onClick={() => {
                setLoadTriggered(true);
                setShowLoadPrompt(false);
              }}
              label={translate('Load reports')}
            />
          </Card.Body>
        </Card>
      )}

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      {loadingStage === 1 && (
        <StageProgress
          stage={1}
          total={3}
          label={translate('Loading project list')}
          done={projectProgress.done}
          max={projectProgress.total}
          statusMsg={projectProgress.statusMsg || undefined}
        />
      )}
      {loadingStage === 2 && (
        <StageProgress
          stage={2}
          total={3}
          label={translate('Loading reports')}
          done={fetchProgress.done}
          max={fetchProgress.total}
        />
      )}
      {loadingStage === 3 && (
        <StageProgress
          stage={3}
          total={3}
          label={translate('Loading name mappings')}
          done={mappingsProgress.done}
          max={mappingsProgress.total}
          statusMsg={mappingsProgress.statusMsg || undefined}
        />
      )}

      {/* ── Slow-load warning ────────────────────────────────────────── */}
      {showSlowWarning && (
        <AlertItem
          type="floating"
          variant="warning"
          className="mb-2.5"
          title={translate('This is taking a while.')}
          body={translate(
            'To speed things up: use a specific year/month filter, or search for fewer projects when loading. Large datasets with many users and projects take longer to process.',
          )}
          actions={
            <BaseButton
              variant="warning"
              size="sm"
              onClick={() => window.location.reload()}
              label={translate('Cancel & reload')}
            />
          }
        />
      )}

      {/* ── Errors ───────────────────────────────────────────────────── */}
      {projectsError && (
        <LoadingErred
          message={translate('Failed to load projects')}
          loadData={refetchProjects}
        />
      )}
      {reportsError && (
        <LoadingErred
          message={translate('Failed to load reports')}
          loadData={refetchReports}
        />
      )}

      {loadTriggered &&
        !projectsLoading &&
        !reportsLoading &&
        !projectsError &&
        !reportsError &&
        allUsage.length === 0 &&
        allStorage.length === 0 &&
        selectedUuids.length > 0 && (
          <p className="text-quaternary">
            {translate(
              'No OpenPortal reports found for the selected projects.',
            )}
          </p>
        )}

      {/* ── Truncated user mapping notice ────────────────────────────── */}
      {usersTruncatedCount > 0 && nameMaps !== undefined && (
        <AlertItem
          type="floating"
          variant="info"
          className="mb-2.5"
          title={translate(
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
          actions={
            <BaseButton
              variant="tertiary"
              size="sm"
              onClick={() => {
                setLoadAllUserMappings(true);
              }}
              label={translate('Load all user names')}
            />
          }
        />
      )}

      {/* ── Charts ───────────────────────────────────────────────────── */}
      {activeUsage.length > 0 && nameMaps !== undefined && !showLoadPrompt && (
        <Card className="mb-3">
          <Card.Header>{translate('Usage')}</Card.Header>
          <Card.Body>
            <UsageReportVis
              reports={activeUsage}
              height="400px"
              nameMaps={nameMaps}
            />
          </Card.Body>
        </Card>
      )}

      {activeStorage.length > 0 &&
        nameMaps !== undefined &&
        !showLoadPrompt && (
          <Card className="mb-3">
            <Card.Header>{translate('Storage')}</Card.Header>
            <Card.Body>
              <StorageReportVis
                reports={activeStorage}
                height="360px"
                nameMaps={nameMaps}
              />
            </Card.Body>
          </Card>
        )}
    </div>
  );
};
