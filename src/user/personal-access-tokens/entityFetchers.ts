import {
  callManagingOrganisationsList,
  customersList,
  marketplacePublicOfferingsList,
  marketplaceResourceProjectsList,
  marketplaceResourcesList,
  marketplaceServiceProvidersList,
  projectsList,
  proposalProposalsList,
  proposalPublicCallsList,
} from 'waldur-js-client';

import { parseSelectData } from '@/core/api';
import { returnReactSelectAsyncPaginateObject } from '@/core/utils';

/**
 * Async-paginate loader for one entity type. Returns {options, hasMore, additional}
 * — the shape AsyncPaginate expects. Each option carries `uuid` and `name`.
 */
type EntityLoader = (
  searchQuery: string,
  prevOptions: { uuid: string; name: string }[],
  page: number,
) => Promise<{
  options: { uuid: string; name: string }[];
  hasMore: boolean;
  additional: { page: number };
}>;

/**
 * Build an entity loader for a given SDK list function.
 *
 * The list endpoints in waldur-mastermind don't share a single
 * filter contract — some accept `query` (full-text), most accept `name`,
 * and a few accept neither. Pass `searchParam` per endpoint so we send
 * only what that endpoint actually accepts; on `none`, the search box
 * just narrows the default-ordered list manually.
 */
const makeLoader = (
  listFn: any,
  searchParam: 'query' | 'name' | 'none',
): EntityLoader => {
  return async (searchQuery, prevOptions, page) => {
    const filter: Record<string, any> = { page };
    if (searchQuery && searchParam !== 'none') {
      filter[searchParam] = searchQuery;
    }
    try {
      const response = await listFn({ query: filter });
      const parsed = parseSelectData(response) as {
        options: { uuid: string; name: string }[];
        totalItems: number;
      };
      // Belt-and-braces: ensure totalItems is a finite number so the
      // AsyncPaginate "load more" loop has a stopping condition even when
      // the backend response is missing the X-Result-Count header.
      if (
        typeof parsed.totalItems !== 'number' ||
        !Number.isFinite(parsed.totalItems)
      ) {
        return {
          options: parsed.options,
          hasMore: false,
          additional: { page: page + 1 },
        };
      }
      return returnReactSelectAsyncPaginateObject(parsed, prevOptions, page);
    } catch {
      // Network/auth error → stop paginating so we don't loop forever.
      return {
        options: prevOptions,
        hasMore: false,
        additional: { page },
      };
    }
  };
};

/**
 * Maps a TYPE_MAP key (as returned by personalAccessTokensAvailableBindingTargets)
 * to the SDK list function for entities of that type. Keys must match the
 * backend's `permissions.enums.TYPE_MAP`.
 */
export const ENTITY_LOADERS: Record<string, EntityLoader> = {
  customer: makeLoader(customersList, 'query'),
  project: makeLoader(projectsList, 'query'),
  offering: makeLoader(marketplacePublicOfferingsList, 'query'),
  resource: makeLoader(marketplaceResourcesList, 'query'),
  resource_project: makeLoader(marketplaceResourceProjectsList, 'name'),
  service_provider: makeLoader(marketplaceServiceProvidersList, 'none'),
  call: makeLoader(proposalPublicCallsList, 'name'),
  proposal: makeLoader(proposalProposalsList, 'name'),
  call_organizer: makeLoader(callManagingOrganisationsList, 'none'),
};

const TYPE_LABELS: Record<string, string> = {
  customer: 'Organization',
  project: 'Project',
  offering: 'Offering',
  resource: 'Resource',
  resource_project: 'Resource project',
  service_provider: 'Service provider',
  call: 'Call',
  proposal: 'Proposal',
  call_organizer: 'Call-managing organisation',
};

export const labelForType = (type: string): string => TYPE_LABELS[type] ?? type;
