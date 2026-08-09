import { FC } from 'react';
import { CallStates } from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';
import { TableTab } from '@/table/types';

import { CallState } from './types';

export const CALL_STATE_VARIANT: Record<CallState, string> = {
  active: 'success',
  draft: 'warning',
  archived: 'gray',
};

interface CallCounts {
  all?: number;
  active?: number;
  draft?: number;
  archived?: number;
}

interface CallCountQueryBase {
  state?: Array<CallStates>;
  page?: number;
  page_size?: number;
}

type CallListFetcher<Q extends CallCountQueryBase> = (args: {
  query: Q;
}) => Promise<Parameters<typeof fetchResultCount>[0]>;

// Fetches the total count for a single call-state filter by hitting the SDK
// with page_size=1 and reading X-Result-Count from the response headers.
const fetchCallCount = async <Q extends CallCountQueryBase>(
  fetcher: CallListFetcher<Q>,
  baseQuery: Q,
  state?: CallStates,
): Promise<number> => {
  const query: Q = { ...baseQuery, page: 1, page_size: 1 };
  if (state) {
    query.state = [state];
  }
  return fetchResultCount(await fetcher({ query }));
};

// Fetches counts for the four call-state tabs (all/active/draft/archived) in
// parallel. Used by both the public and protected call lists.
export const fetchAllCallCounts = async <Q extends CallCountQueryBase>(
  fetcher: CallListFetcher<Q>,
  baseQuery: Q,
): Promise<CallCounts> => {
  const [all, active, draft, archived] = await Promise.all([
    fetchCallCount(fetcher, baseQuery),
    fetchCallCount(fetcher, baseQuery, 'active'),
    fetchCallCount(fetcher, baseQuery, 'draft'),
    fetchCallCount(fetcher, baseQuery, 'archived'),
  ]);
  return { all, active, draft, archived };
};

const TabTitle: FC<{ label: string; count?: number }> = ({ label, count }) => (
  <span className="d-flex align-items-center gap-2">
    {label}
    {typeof count === 'number' && (
      <Badge variant="secondary" size="sm" pill outline>
        {count}
      </Badge>
    )}
  </span>
);

/**
 * The call states a list should be filtered by, from either writer of `?state`.
 *
 * The state tabs below navigate with `?state=active` — a bare string — while a
 * table with `syncFiltersToURL` writes the multi-select filter's
 * `{value, label}` objects back to the same parameter as JSON. Two writers, one
 * key: whichever wrote last, the other misread it. The generated filter
 * selector called `.map` on a string and threw, taking the whole page down.
 *
 * Lists using these tabs should therefore leave `?state` to the tabs
 * (`syncFiltersToURL: false`) and resolve the value through this, which accepts
 * either shape so an existing bookmark of either form still works.
 */
export const resolveCallStateFilter = (
  ...sources: unknown[]
): CallStates[] | undefined => {
  const raw = sources.find((source) =>
    Array.isArray(source) ? source.length : Boolean(source),
  );
  if (!raw) {
    return undefined;
  }
  const values = (Array.isArray(raw) ? raw : [raw])
    .map((item: any) => (typeof item === 'string' ? item : item?.value))
    .filter(Boolean);
  return values.length ? (values as CallStates[]) : undefined;
};

export const buildCallTabs = (counts?: CallCounts): TableTab[] => [
  {
    key: 'all',
    title: <TabTitle label={translate('All')} count={counts?.all} />,
    params: { state: undefined },
    default: true,
  },
  {
    key: 'active',
    title: <TabTitle label={translate('Active')} count={counts?.active} />,
    params: { state: 'active' },
  },
  {
    key: 'draft',
    title: <TabTitle label={translate('Draft')} count={counts?.draft} />,
    params: { state: 'draft' },
  },
  {
    key: 'archived',
    title: <TabTitle label={translate('Archived')} count={counts?.archived} />,
    params: { state: 'archived' },
  },
];
