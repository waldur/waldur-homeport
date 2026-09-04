import { useQuery } from '@tanstack/react-query';
import {
  AffiliatedOrganization,
  AffiliatedOrganizationReportRow,
  affiliatedOrganizationsList,
  affiliatedOrganizationsReportList,
} from 'waldur-js-client';

import { STALE_TIME } from '@/core/constants';

/** The report row plus the two registry attributes it does not carry. */
export type AffiliationRow = AffiliatedOrganizationReportRow & {
  code: string | null;
  country: string | null;
};

export interface AffiliationCountryRow {
  country: string | null;
  organizations: number;
  projects_count: number;
  resources_count: number;
  estimated_cost: number;
}

export interface AffiliationReport {
  rows: AffiliationRow[];
  byCountry: AffiliationCountryRow[];
  summary: {
    organizations: number;
    withProjects: number;
    affiliatedProjects: number;
    unaffiliatedProjects: number;
    /** Percent of projects carrying an affiliation; null when there are none. */
    coverage: number | null;
    totalCost: number;
  };
}

const PAGE_SIZE = 200;
const MAX_PAGES = 50;

const toNumber = (value: string) => parseFloat(value) || 0;

const sum = <T>(rows: T[], get: (row: T) => number) =>
  rows.reduce((total, row) => total + get(row), 0);

async function fetchAllPages<T>(
  fetchPage: (page: number) => Promise<{ data?: T[] }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = (await fetchPage(page)).data ?? [];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
  }
  return rows;
}

function rollupByCountry(rows: AffiliationRow[]): AffiliationCountryRow[] {
  const buckets = new Map<string, AffiliationCountryRow>();
  rows.forEach((row) => {
    const bucket = buckets.get(row.country ?? '') ?? {
      country: row.country,
      organizations: 0,
      projects_count: 0,
      resources_count: 0,
      estimated_cost: 0,
    };
    bucket.organizations += 1;
    bucket.projects_count += row.projects_count;
    bucket.resources_count += row.resources_count;
    bucket.estimated_cost += toNumber(row.estimated_cost);
    buckets.set(row.country ?? '', bucket);
  });
  return [...buckets.values()].sort(
    (a, b) => b.projects_count - a.projects_count,
  );
}

export function buildAffiliationReport(
  reportRows: AffiliatedOrganizationReportRow[],
  organizations: AffiliatedOrganization[],
): AffiliationReport {
  const registry = new Map(organizations.map((org) => [org.uuid, org]));
  const rows: AffiliationRow[] = reportRows.map((row) => {
    const org = row.org_uuid ? registry.get(row.org_uuid) : undefined;
    return { ...row, code: org?.code || null, country: org?.country || null };
  });

  // Default order for the table; its headers can re-sort from here.
  const affiliated = rows
    .filter((row) => row.org_uuid)
    .sort((a, b) => b.projects_count - a.projects_count);
  const unaffiliated = rows.filter((row) => !row.org_uuid);

  const affiliatedProjects = sum(affiliated, (row) => row.projects_count);
  const unaffiliatedProjects = sum(unaffiliated, (row) => row.projects_count);
  const projects = affiliatedProjects + unaffiliatedProjects;

  return {
    rows: [...affiliated, ...unaffiliated],
    byCountry: rollupByCountry(affiliated),
    summary: {
      organizations: organizations.length,
      withProjects: affiliated.filter((row) => row.projects_count > 0).length,
      affiliatedProjects,
      unaffiliatedProjects,
      coverage: projects ? (affiliatedProjects / projects) * 100 : null,
      totalCost: sum(rows, (row) => toNumber(row.estimated_cost)),
    },
  };
}

export function useAffiliationReport() {
  return useQuery({
    queryKey: ['affiliatedOrganizationsReport'],
    queryFn: async ({ signal }) => {
      const query = { page_size: PAGE_SIZE };
      const [reportRows, organizations] = await Promise.all([
        fetchAllPages<AffiliatedOrganizationReportRow>((page) =>
          affiliatedOrganizationsReportList({
            query: { ...query, page },
            signal,
          }),
        ),
        fetchAllPages<AffiliatedOrganization>((page) =>
          affiliatedOrganizationsList({ query: { ...query, page }, signal }),
        ),
      ]);
      return buildAffiliationReport(reportRows, organizations);
    },
    staleTime: STALE_TIME,
  });
}
