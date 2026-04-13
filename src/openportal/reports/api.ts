/**
 * Fetch helpers for the two cached OpenPortal report endpoints.
 *
 * Data is fetched once and returned as wrapper class instances.
 * All subsequent filtering/aggregation is done client-side via the class
 * methods — no re-fetches occur.
 *
 * Identifier → name mappings are cached per-identifier in localStorage so
 * that a storage-quota failure only affects individual entries rather than
 * losing the entire mapping dictionary.
 */

/* eslint-disable waldur-custom/no-direct-client-usage */
import { get, fixURL, getHeaders } from '@waldur/core/api';

import { getCached, setCached, TTL } from './localStorageCache';
import { ProjectStorageReport } from './ProjectStorageReport';
import { ProjectUsageReport } from './ProjectUsageReport';
import type { ProjectAccountingSummary } from './types';
import {
  StorageReportApiItem,
  StorageReportFilters,
  UsageReportApiItem,
  UsageReportFilters,
} from './types';

async function getAllWithProgress<T>(
  endpoint: string,
  onProgress?: (page: number, totalPages: number | undefined) => void,
): Promise<T[]> {
  const results: T[] = [];
  let url: string | null = fixURL(`/api${endpoint}`);
  let page = 0;
  let totalPages: number | undefined;
  while (url) {
    const response = await fetch(url, { headers: getHeaders() });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
    const data: T[] = await response.json();
    results.push(...data);
    page += 1;
    const linkHeader = response.headers.get('Link');
    const countHeader = response.headers.get('X-Result-Count');
    const pageSize = data.length;
    if (countHeader && pageSize > 0) {
      totalPages = Math.ceil(parseInt(countHeader) / pageSize);
    }
    if (onProgress) onProgress(page, totalPages);
    const match = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
    url = match ? match[1] : null;
  }
  return results;
}

function getAll<T>(endpoint: string): Promise<T[]> {
  return getAllWithProgress<T>(endpoint);
}

function buildQuery(filters: object): string {
  const params = new URLSearchParams(
    Object.entries(filters)
      .filter(([, v]) => v !== undefined && v !== null)
      .map(([k, v]) => [k, String(v)]),
  );
  const s = params.toString();
  return s ? `?${s}` : '';
}

/**
 * Fetch cached usage reports matching the given filters.
 * Returns one ProjectUsageReport per API envelope item.
 * Use ProjectUsageReport.combine() to merge them if needed.
 */
type ProgressCallback = (page: number, totalPages: number | undefined) => void;

export const fetchUsageReports = async (
  filters: UsageReportFilters = {},
  onProgress?: ProgressCallback,
): Promise<ProjectUsageReport[]> => {
  const endpoint = `/openportal-project-usage-reports/${buildQuery(filters)}`;
  const items = onProgress
    ? await getAllWithProgress<UsageReportApiItem>(endpoint, onProgress)
    : await getAll<UsageReportApiItem>(endpoint);
  return items.map(ProjectUsageReport.fromApiResponse);
};

/**
 * Fetch cached storage reports matching the given filters.
 * Returns one ProjectStorageReport per API envelope item.
 * Use ProjectStorageReport.combine() to merge them if needed.
 */
export const fetchStorageReports = async (
  filters: StorageReportFilters = {},
  onProgress?: ProgressCallback,
): Promise<ProjectStorageReport[]> => {
  const endpoint = `/openportal-project-storage-reports/${buildQuery(filters)}`;
  const items = onProgress
    ? await getAllWithProgress<StorageReportApiItem>(endpoint, onProgress)
    : await getAll<StorageReportApiItem>(endpoint);
  return items.map(ProjectStorageReport.fromApiResponse);
};

// ── Identifier → name mapping endpoints ──────────────────────────────────────

const MAPPING_BATCH_SIZE = 25;

/** Number of batches that will be needed for `ids`. */
export const mappingBatchCount = (ids: string[]): number =>
  Math.ceil(ids.length / MAPPING_BATCH_SIZE);

type MappingProgressCallback = (batchesDone: number) => void;

/**
 * Fetch an identifier→info mapping, using per-identifier localStorage caching.
 *
 * Each identifier is stored individually (key: `map-{endpoint}-{id}`) so a
 * localStorage quota failure only evicts single entries rather than the
 * entire dictionary — preventing the endless refetch cycle that occurred
 * when a large NameMaps blob was rejected.
 *
 * Progress callback semantics: `onProgress(batchesDone)` where batches are
 * counted across ALL identifiers (cached hits count as instant batches) so
 * the denominator computed by `mappingBatchCount(ids)` stays accurate.
 */
async function fetchMappingBatched<T>(
  endpoint: string,
  identifiers: string[],
  onProgress?: MappingProgressCallback,
): Promise<Record<string, T>> {
  if (identifiers.length === 0) return {};

  const result: Record<string, T> = {};
  const uncachedIds: string[] = [];

  // Check per-identifier cache first
  for (const id of identifiers) {
    const cached = getCached<T>(`map-${endpoint}-${id}`, TTL.MAPPINGS);
    if (cached !== null) {
      result[id] = cached;
    } else {
      uncachedIds.push(id);
    }
  }

  // Report cached batches as immediately completed (rapid progress advance)
  const cachedCount = identifiers.length - uncachedIds.length;
  const cachedBatches = Math.ceil(cachedCount / MAPPING_BATCH_SIZE);
  if (cachedBatches > 0 && onProgress) {
    for (let b = 1; b <= cachedBatches; b++) onProgress(b);
  }

  // Fetch uncached identifiers in batches
  for (let i = 0; i < uncachedIds.length; i += MAPPING_BATCH_SIZE) {
    const chunk = uncachedIds.slice(i, i + MAPPING_BATCH_SIZE);
    const params = new URLSearchParams();
    for (const id of chunk) params.append('identifier', id);
    const data = await get<Record<string, T>>(
      `/openportal/${endpoint}/?${params}`,
    );
    for (const [id, value] of Object.entries(data)) {
      setCached(`map-${endpoint}-${id}`, value);
      result[id] = value as T;
    }
    if (onProgress)
      onProgress(cachedBatches + Math.floor(i / MAPPING_BATCH_SIZE) + 1);
  }

  return result;
}

interface OfferingInfo {
  uuid: string;
  name: string;
  description: string;
  slug: string;
}

interface ProjectInfo {
  uuid: string;
  name: string;
  customer_uuid: string;
  customer_name: string;
}

interface UserInfo {
  uuid: string;
  full_name: string;
  username: string;
  email: string;
}

export const fetchOfferingMapping = (
  ids: string[],
  onProgress?: MappingProgressCallback,
) => fetchMappingBatched<OfferingInfo>('offering_mapping', ids, onProgress);
export const fetchProjectMapping = (
  ids: string[],
  onProgress?: MappingProgressCallback,
) => fetchMappingBatched<ProjectInfo>('project_mapping', ids, onProgress);
export const fetchUserMapping = (
  ids: string[],
  onProgress?: MappingProgressCallback,
) => fetchMappingBatched<UserInfo>('user_mapping', ids, onProgress);

// ── Accounting Summary stub (replace after mastermind MR1 + SDK regen) ────────

/** Stub for openportalAccountingSummaryList — will be replaced by SDK-generated function */
export const openportalAccountingSummaryList = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _options: {
    query?: { customer_uuid?: string; page_size?: number; page?: number };
  },
): Promise<{ data: ProjectAccountingSummary[]; response: Response }> => {
  return Promise.resolve({ data: [], response: new Response() });
};
