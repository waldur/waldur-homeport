import { useQuery } from '@tanstack/react-query';
import { getAllPages, MAX_PAGE_SIZE } from 'waldur-api-client';
import {
  marketplaceOrdersList,
  MyTask,
  OfferingDemand,
  OrderDetails,
  OrderState,
  OfferingTeamSlot,
  ProviderRequestedOffering,
  ProviderRequestedResource,
  proposalMyTasksList,
  proposalMyTasksSummaryRetrieve,
  proposalOfferingDemandList,
  proposalRequestedOfferingsList,
  proposalRequestedOfferingsTeamSlotsList,
  proposalRequestedResourcesList,
  RequestedOfferingStates,
} from 'waldur-js-client';

/**
 * One query per provider endpoint. `providerUuid` undefined means every
 * provider the user works for: the endpoints scope to the user's roles
 * themselves, so no filter is the same as "all mine".
 *
 * Lists are fetched whole (every page) and shown without a pager: a
 * provider's calls, requests and open slots are tens of rows, not thousands.
 * Proposals are the one list that can grow; it is capped, see below.
 */
const KEY = 'provider-calls';

const withProvider = (providerUuid?: string) =>
  providerUuid ? { provider_uuid: providerUuid } : {};

export const useTaskSummary = (providerUuid?: string) =>
  useQuery({
    queryKey: [KEY, 'task-summary', providerUuid],
    queryFn: async () =>
      (
        await proposalMyTasksSummaryRetrieve({
          query: withProvider(providerUuid),
        })
      ).data,
  });

export const useTasks = (providerUuid?: string) =>
  useQuery<MyTask[]>({
    queryKey: [KEY, 'tasks', providerUuid],
    queryFn: () =>
      getAllPages((page) =>
        proposalMyTasksList({
          query: {
            ...withProvider(providerUuid),
            page,
            page_size: MAX_PAGE_SIZE,
          },
        }),
      ),
  });

export const useRequestedOfferings = (
  providerUuid?: string,
  state?: RequestedOfferingStates[],
) =>
  useQuery<ProviderRequestedOffering[]>({
    queryKey: [KEY, 'requested-offerings', providerUuid, state],
    queryFn: () =>
      getAllPages((page) =>
        proposalRequestedOfferingsList({
          query: {
            ...withProvider(providerUuid),
            ...(state ? { state } : {}),
            o: ['-created'],
            page,
            page_size: MAX_PAGE_SIZE,
          },
        }),
      ),
  });

/** Not paginated: the action returns every open slot, soonest due first. */
export const useTeamSlots = (providerUuid?: string) =>
  useQuery<OfferingTeamSlot[]>({
    queryKey: [KEY, 'team-slots', providerUuid],
    queryFn: async () =>
      (
        await proposalRequestedOfferingsTeamSlotsList({
          query: withProvider(providerUuid),
        })
      ).data ?? [],
  });

export const PROPOSALS_SHOWN = 200;

export const useRequestedResources = (providerUuid?: string) =>
  useQuery({
    queryKey: [KEY, 'requested-resources', providerUuid],
    queryFn: async () => {
      const result = await proposalRequestedResourcesList({
        query: {
          ...withProvider(providerUuid),
          o: ['-created'],
          page_size: PROPOSALS_SHOWN,
        },
      });
      const total = Number(result.response.headers.get('x-result-count'));
      return {
        rows: (result.data ?? []) as ProviderRequestedResource[],
        total: Number.isFinite(total) ? total : (result.data ?? []).length,
      };
    },
  });

/** Not paginated: one row per offering × call × round × state group. */
export const useOfferingDemand = (providerUuid?: string) =>
  useQuery<OfferingDemand[]>({
    queryKey: [KEY, 'demand', providerUuid],
    queryFn: async () =>
      (
        await proposalOfferingDemandList({
          query: withProvider(providerUuid),
        })
      ).data ?? [],
  });

export const PROVIDER_CALLS_QUERY_KEY = KEY;

/**
 * The orders that awards placed on the provider's offerings. An award is
 * provisioned as an ordinary marketplace order, which the provider approves
 * or rejects in its order queue like any other: that is its last say on
 * whether it can deliver what the call granted.
 */
export const useAwardOrders = (
  providerUuid: string | undefined,
  state: OrderState[],
) =>
  useQuery<OrderDetails[]>({
    queryKey: [KEY, 'award-orders', providerUuid, state],
    enabled: Boolean(providerUuid),
    queryFn: () =>
      getAllPages((page) =>
        marketplaceOrdersList({
          query: {
            provider_uuid: providerUuid,
            from_award: true,
            state,
            type: ['Create'],
            o: ['-created'],
            page,
            page_size: MAX_PAGE_SIZE,
          },
        }),
      ),
  });
