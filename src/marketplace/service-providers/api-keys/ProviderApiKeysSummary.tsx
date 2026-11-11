import { useQuery } from '@tanstack/react-query';
import { FC, useEffect, useRef } from 'react';
import {
  marketplaceResourceApiKeysCount,
  marketplaceResourceApiKeysUsageTotalsRetrieve,
  MarketplaceResourceApiKeysListData,
} from 'waldur-js-client';

import { fetchResultCount } from '@/core/api';
import { defaultCurrency } from '@/core/formatCurrency';
import { HelpTip } from '@/core/HelpTip';
import { translate } from '@/i18n';
import { DASH_ESCAPE_CODE } from '@/table/constants';

type KeyQuery = NonNullable<MarketplaceResourceApiKeysListData['query']>;

/** The figures above the provider's key list, for the keys its filters match. */
export interface ApiKeysSummary {
  keys: number;
  pausedByLimit: number;
  erred: number;
  estimatedCost: string;
}

const count = (query: KeyQuery, signal: AbortSignal) =>
  marketplaceResourceApiKeysCount({ query, signal }).then(fetchResultCount);

/**
 * Loads the summary for the list's own filter, so the line always describes
 * the rows below it. A filter that already rules a figure out (a state filter
 * without Erred, or "not paused by a limit") makes that figure 0 without a
 * request.
 */
export const fetchApiKeysSummary = async (
  filter: KeyQuery,
  signal: AbortSignal,
): Promise<ApiKeysSummary> => {
  const states = filter.state ?? [];
  const erredExcluded = states.length > 0 && !states.includes('Erred');
  const pausedExcluded = filter.paused_by_limit === false;
  const [keys, pausedByLimit, erred, totals] = await Promise.all([
    count(filter, signal),
    pausedExcluded ? 0 : count({ ...filter, paused_by_limit: true }, signal),
    erredExcluded ? 0 : count({ ...filter, state: ['Erred'] }, signal),
    marketplaceResourceApiKeysUsageTotalsRetrieve({
      query: filter,
      signal,
    }).then((response) => response.data),
  ]);
  return {
    keys,
    pausedByLimit,
    erred,
    estimatedCost: totals.estimated_cost,
  };
};

export const ProviderApiKeysSummary: FC<{
  filter: KeyQuery;
  /** The list is reloading; the summary reloads with it once it is done. */
  tableLoading: boolean;
}> = ({ filter, tableLoading }) => {
  const query = useQuery({
    queryKey: ['provider-api-keys-summary', filter],
    queryFn: ({ signal }) => fetchApiKeysSummary(filter, signal),
    refetchOnWindowFocus: false,
  });
  const { data, refetch } = query;
  // A refresh of the rows (the refresh button, a page change) does not change
  // the filter, so the summary would keep its old figures. When the rows have
  // reloaded, the summary reloads too, unless it is loading already or has
  // loaded since the rows began to (as on a new filter, whose new query key
  // fetches by itself).
  const queryRef = useRef(query);
  queryRef.current = query;
  const loadStartedAt = useRef<number | null>(null);
  useEffect(() => {
    if (tableLoading) {
      loadStartedAt.current ??= Date.now();
      return;
    }
    const startedAt = loadStartedAt.current;
    loadStartedAt.current = null;
    const { isFetching, dataUpdatedAt } = queryRef.current;
    if (startedAt !== null && !isFetching && dataUpdatedAt < startedAt) {
      refetch();
    }
  }, [tableLoading, refetch]);
  const value = (figure?: number | string | null) =>
    figure === undefined || figure === null ? DASH_ESCAPE_CODE : figure;
  return (
    <span
      className="flex flex-wrap gap-x-5 gap-y-1 text-tertiary"
      data-testid="provider-api-keys-summary"
    >
      <span>
        {translate('Keys')}: {value(data?.keys)}
      </span>
      <span>
        {translate('Paused by a limit')}: {value(data?.pausedByLimit)}
      </span>
      <span>
        {translate('Erred')}: {value(data?.erred)}
      </span>
      <span>
        {translate('Estimated cost this month')}:{' '}
        {value(data && defaultCurrency(data.estimatedCost))}
        {/* Unlike the counts and the rows: deleting a key leaves its usage. */}
        <HelpTip
          hasSpace
          label={translate(
            'Includes the usage of keys deleted this month, which the list leaves out.',
          )}
        />
      </span>
    </span>
  );
};
