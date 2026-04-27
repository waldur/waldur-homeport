import { useQuery } from '@tanstack/react-query';
import {
  customersHistoryList,
  customersHistoryAtRetrieve,
  usersHistoryList,
  usersHistoryAtRetrieve,
  keysHistoryList,
  keysHistoryAtRetrieve,
  marketplaceResourcesHistoryList,
  marketplaceResourcesHistoryAtRetrieve,
  marketplaceProviderOfferingsHistoryList,
  marketplaceProviderOfferingsHistoryAtRetrieve,
  marketplacePlansHistoryList,
  marketplacePlansHistoryAtRetrieve,
  VersionHistory,
} from 'waldur-js-client';

import { SHORT_STALE_TIME } from '@/core/constants';

import { HistoryEntityType } from './types';

type HistoryListFn = (options: {
  path: { uuid: string };
}) => Promise<{ data: VersionHistory[] }>;

type HistoryAtFn = (options: {
  path: { uuid: string };
  query: { timestamp: string };
}) => Promise<{ data: VersionHistory }>;

const historyListFunctions: Record<HistoryEntityType, HistoryListFn> = {
  resource: marketplaceResourcesHistoryList,
  customer: customersHistoryList,
  user: usersHistoryList,
  ssh_key: keysHistoryList,
  offering: marketplaceProviderOfferingsHistoryList,
  plan: marketplacePlansHistoryList,
};

const historyAtFunctions: Record<HistoryEntityType, HistoryAtFn> = {
  resource: marketplaceResourcesHistoryAtRetrieve,
  customer: customersHistoryAtRetrieve,
  user: usersHistoryAtRetrieve,
  ssh_key: keysHistoryAtRetrieve,
  offering: marketplaceProviderOfferingsHistoryAtRetrieve,
  plan: marketplacePlansHistoryAtRetrieve,
};

export const useVersionHistory = (
  entityType: HistoryEntityType,
  entityUuid: string,
) => {
  return useQuery({
    queryKey: ['versionHistory', entityType, entityUuid],
    queryFn: async () => {
      const fn = historyListFunctions[entityType];
      const result = await fn({ path: { uuid: entityUuid } });
      return result.data;
    },
    staleTime: SHORT_STALE_TIME,
  });
};

export const useVersionAtTimestamp = (
  entityType: HistoryEntityType,
  entityUuid: string,
  timestamp: string | null,
) => {
  return useQuery({
    queryKey: ['versionAtTimestamp', entityType, entityUuid, timestamp],
    queryFn: async () => {
      const fn = historyAtFunctions[entityType];
      const result = await fn({
        path: { uuid: entityUuid },
        query: { timestamp: timestamp! },
      });
      return result.data;
    },
    enabled: !!timestamp,
    staleTime: SHORT_STALE_TIME,
  });
};
