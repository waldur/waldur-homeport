import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import {
  marketplaceResourceApiKeysList,
  marketplaceResourceApiKeysRevealRetrieve,
  Resource,
  ResourceApiKeyState,
  ResourceApiKeyStatus,
} from 'waldur-js-client';

import { createFetcher } from '@/table/api';
import { useTable } from '@/table/useTable';

/** States where the agent is mid-operation — the row shows a spinner and the
 * table keeps polling until the key settles. */
export const TRANSITIONAL: ResourceApiKeyState[] = ['Creating', 'Updating'];

const revealKey = (keyUuid: string) => ['resource-api-key-reveal', keyUuid];

/** Table wiring for a resource's API keys.
 *
 * Shared so the standalone API keys tab and the inference view (which needs the
 * rows to pick the key the playground authenticates with) fetch identically.
 */
export const useResourceApiKeysTable = (resource: Resource) => {
  const filter = useMemo(
    () => ({ resource_uuid: resource.uuid }),
    [resource.uuid],
  );
  return useTable<ResourceApiKeyStatus>({
    table: `resource-api-keys-${resource.uuid}`,
    fetchData: createFetcher(marketplaceResourceApiKeysList),
    filter,
  });
};

export interface RevealedApiKey {
  value: string | null;
  revealing: boolean;
  reveal: () => Promise<string | null>;
}

/** Lazily reveals one key's value — the request (and its audit log) only fires
 * when reveal() is called (eye click, or the playground opening). */
export const useRevealedApiKey = (keyUuid: string): RevealedApiKey => {
  const query = useQuery({
    queryKey: revealKey(keyUuid),
    queryFn: () =>
      marketplaceResourceApiKeysRevealRetrieve({
        path: { uuid: keyUuid },
      }).then((response) => response.data),
    enabled: false,
    staleTime: Infinity,
  });
  const { refetch } = query;
  const reveal = useCallback(async () => {
    const result = await refetch();
    return result.data?.api_key ?? null;
  }, [refetch]);
  return {
    value: query.data?.api_key ?? null,
    revealing: query.isFetching,
    reveal,
  };
};

/** Invalidate the reveal cache for a key after it rotates (old value is stale). */
export const useInvalidateRevealedKey = () => {
  const queryClient = useQueryClient();
  return useCallback(
    (keyUuid: string) =>
      queryClient.removeQueries({ queryKey: revealKey(keyUuid) }),
    [queryClient],
  );
};
