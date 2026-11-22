import { useQueries, useQuery } from '@tanstack/react-query';
import { getAllPages, MAX_PAGE_SIZE } from 'waldur-api-client';
import {
  ChartSpec,
  marketplaceOrdersList,
  marketplaceOrdersRetrieve,
  marketplacePublicOfferingsList,
  marketplacePublicOfferingsRetrieve,
  marketplaceResourceApiKeysList,
  marketplaceResourcesList,
  Project,
  projectsList,
  projectsListUsersList,
  Resource,
  rolesList,
  usersMeRetrieve,
} from 'waldur-js-client';
import { client } from 'waldur-js-client/client.gen';

import { Grants } from './permissions';
import {
  isInferenceService,
  isTransitionalKey,
  servesInference,
} from './services';

/** Every query of this app starts with this key; a mutation refetches them. */
export const QUERY_KEY = 'ai-inference';

/** Inference gateways are site-agent offerings (LiteLLM, Envoy AI Gateway). */
const SITE_AGENT_TYPE = 'Marketplace.SiteAgent';

/** States in which a service exists for the project, or is on its way. */
const LIVE_STATES: Resource['state'][] = [
  'Creating',
  'OK',
  'Updating',
  'Erred',
];

/** How often the services are read again while one is being set up. */
const SERVICE_POLL_MS = 4_000;

/** How often the key list is read again while a key is changing. */
const KEY_POLL_MS = 5_000;

export const useProjects = () =>
  useQuery({
    queryKey: [QUERY_KEY, 'projects'],
    queryFn: () =>
      getAllPages((page) =>
        projectsList({
          query: { page, page_size: MAX_PAGE_SIZE, o: ['name'] },
        }),
      ),
  });

export const useMe = () =>
  useQuery({
    queryKey: [QUERY_KEY, 'me'],
    queryFn: () => usersMeRetrieve().then((response) => response.data),
    staleTime: Infinity,
  });

/**
 * The project's inference services: its site-agent resources whose offering
 * has API keys or the inference view. No filter names those, so the
 * project's site-agent resources are read and filtered here.
 */
export const useServices = (projectUuid?: string) =>
  useQuery({
    queryKey: [QUERY_KEY, 'services', projectUuid],
    enabled: !!projectUuid,
    queryFn: async () => {
      const resources = await getAllPages((page) =>
        marketplaceResourcesList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            project_uuid: projectUuid,
            offering_type: SITE_AGENT_TYPE,
            state: LIVE_STATES,
            o: ['name'],
          },
        }),
      );
      return resources.filter(isInferenceService);
    },
    // A service on its way: follow it from approval to Active.
    refetchInterval: (query) =>
      query.state.data?.some((resource) => resource.state === 'Creating')
        ? SERVICE_POLL_MS
        : false,
  });

/** The inference offerings a project can add, newest-named first by name. */
export const useInferenceOfferings = () =>
  useQuery({
    queryKey: [QUERY_KEY, 'inference-offerings'],
    queryFn: async () => {
      const offerings = await getAllPages((page) =>
        marketplacePublicOfferingsList({
          query: {
            page,
            page_size: MAX_PAGE_SIZE,
            type: [SITE_AGENT_TYPE],
            state: ['Active'],
            o: ['name'],
          },
        }),
      );
      return offerings.filter((offering) =>
        servesInference(offering.plugin_options),
      );
    },
    staleTime: 5 * 60_000,
  });

/**
 * What the user may do, read once: their roles from /users/me/ and the
 * permissions each role carries from /roles/.
 */
export const useGrants = () =>
  useQuery({
    queryKey: [QUERY_KEY, 'grants'],
    queryFn: async (): Promise<Grants> => {
      const [me, roles] = await Promise.all([
        usersMeRetrieve().then((response) => response.data),
        getAllPages((page) =>
          rolesList({ query: { page, page_size: MAX_PAGE_SIZE } }),
        ),
      ]);
      return {
        userUuid: me.uuid,
        isStaff: !!me.is_staff,
        permissions: me.permissions ?? [],
        roles: new Map(
          roles
            .filter((role) => role.is_active !== false)
            .map((role) => [role.name, new Set(role.permissions ?? [])]),
        ),
      };
    },
    staleTime: 5 * 60_000,
  });

/** The project's members, to assign a key to. */
export const useProjectUsers = (project: Project, enabled: boolean) =>
  useQuery({
    queryKey: [QUERY_KEY, 'project-users', project.uuid],
    enabled,
    queryFn: () =>
      getAllPages((page) =>
        projectsListUsersList({
          path: { uuid: project.uuid },
          query: { page, page_size: MAX_PAGE_SIZE },
        }),
      ),
    staleTime: 60_000,
  });

/**
 * The offerings behind the services, for the models they list and their
 * endpoints. One request per offering; a project has a handful.
 */
export const useOfferings = (offeringUuids: string[]) =>
  useQueries({
    queries: offeringUuids.map((uuid) => ({
      queryKey: [QUERY_KEY, 'offering', uuid],
      queryFn: () =>
        marketplacePublicOfferingsRetrieve({ path: { uuid } }).then(
          (response) => response.data,
        ),
      staleTime: 5 * 60_000,
    })),
    combine: (results) => ({
      byUuid: new Map(
        results
          .map((result) => result.data)
          .filter(Boolean)
          .map((offering) => [offering.uuid, offering]),
      ),
      isLoading: results.some((result) => result.isLoading),
    }),
  });

/**
 * The project's API keys. Deleted ones are left out by the API. Read again
 * every few seconds while one is being created, changed or deleted.
 */
export const useProjectKeys = (projectUuid?: string) =>
  useQuery({
    queryKey: [QUERY_KEY, 'keys', projectUuid],
    enabled: !!projectUuid,
    queryFn: () =>
      getAllPages((page) =>
        marketplaceResourceApiKeysList({
          query: { page, page_size: MAX_PAGE_SIZE, project_uuid: projectUuid },
        }),
      ),
    refetchInterval: (query) =>
      query.state.data?.some(isTransitionalKey) ? KEY_POLL_MS : false,
  });

/**
 * Whether the user may approve this service's order: the backend's own
 * answer (can_approve_as_consumer), which weighs roles, the offering and
 * approval rules, rather than a guess from role names.
 */
export const useCanApproveOrder = (resourceUuid: string, enabled: boolean) =>
  useQuery({
    queryKey: [QUERY_KEY, 'can-approve', resourceUuid],
    enabled,
    queryFn: async () => {
      const { data } = await marketplaceOrdersList({
        query: {
          can_approve_as_consumer: true,
          resource_uuid: resourceUuid,
          page_size: 1,
        },
      });
      return (data ?? []).length > 0;
    },
  });

/**
 * Whether the user can reach the order at all. A project member has no
 * ORDER.LIST, so cannot see, nor withdraw, an order they placed.
 */
export const useCanSeeOrder = (orderUuid: string, enabled: boolean) =>
  useQuery({
    queryKey: [QUERY_KEY, 'can-see-order', orderUuid],
    enabled,
    queryFn: async () => {
      try {
        await marketplaceOrdersRetrieve({ path: { uuid: orderUuid } });
        return true;
      } catch {
        return false;
      }
    },
    retry: false,
  });

/**
 * What the keys spent over time, with charts (the API keys' insights
 * action). Not in the generated SDK yet, so it goes through the SDK's
 * configured client directly.
 */
export interface KeyInsights {
  days: number;
  spent_this_month: string;
  daily_pace: string;
  forecast_this_month: string;
  /** The service's own month limit as money; with one service only. */
  month_limit: string | null;
  /** When that limit is reached at the recent pace, if this month. */
  runs_out: string | null;
  active_keys: number;
  paused_keys: number;
  charts: ChartSpec[];
}

export const useKeyInsights = (scope: {
  projectUuid: string;
  resourceUuid?: string;
  userUuid?: string;
  days: number;
}) =>
  useQuery({
    queryKey: [QUERY_KEY, 'insights', scope],
    queryFn: async () => {
      const { data } = await client.get<{ 200: KeyInsights }, unknown, true>({
        url: '/api/marketplace-resource-api-keys/insights/',
        query: {
          project_uuid: scope.projectUuid,
          resource_uuid: scope.resourceUuid,
          user_uuid: scope.userUuid,
          days: scope.days,
        },
        throwOnError: true,
      });
      return data;
    },
    // Usage comes in every few hours; a minute is fresh enough.
    staleTime: 60_000,
  });
