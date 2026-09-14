import {
  marketplaceResourceLimitChangeRequestsList,
  MergedPluginOptions,
} from 'waldur-js-client';

import { hasEditableLimitComponents } from '../change-limits/utils';

/**
 * Limit change requests are an opt-in offering feature: without the option the
 * backend refuses both new requests and approvals, so neither the request
 * action nor the approvers' list has anything to offer.
 *
 * Takes the plugin options of the offering as the API renders it — for a child
 * offering those are its parent's, which is what the backend checks.
 */
export const isLimitChangeRequestsEnabled = (
  pluginOptions: MergedPluginOptions | undefined,
): boolean => Boolean(pluginOptions?.enable_resource_limit_change_requests);

interface LimitChangeRequestsTabContext {
  /** Whether the viewer may decide limit change requests on this resource. */
  canManage: boolean;
  offering:
    | (Parameters<typeof hasEditableLimitComponents>[0] & {
        plugin_options?: MergedPluginOptions;
      })
    | undefined;
  plan: Parameters<typeof hasEditableLimitComponents>[1];
  hasPlan: boolean;
}

// A limit change is only feasible with editable limit components and a plan of
// the resource's own — child resources (e.g. OpenStack instances/volumes)
// inherit the parent offering's components but have no plan.
const decidesLimitChangeRequests = ({
  canManage,
  offering,
  plan,
  hasPlan,
}: LimitChangeRequestsTabContext): boolean =>
  Boolean(canManage && hasPlan && hasEditableLimitComponents(offering, plan));

/**
 * The pending count only matters once the offering has opted out: requests
 * still pending from before keep the tab reachable, so approvers can reject
 * them.
 */
export const needsPendingLimitChangeRequestsCount = (
  context: LimitChangeRequestsTabContext,
): boolean =>
  decidesLimitChangeRequests(context) &&
  !isLimitChangeRequestsEnabled(context.offering?.plugin_options);

export const shouldShowLimitChangeRequestsTab = (
  context: LimitChangeRequestsTabContext & { pendingCount: number },
): boolean =>
  decidesLimitChangeRequests(context) &&
  (isLimitChangeRequestsEnabled(context.offering?.plugin_options) ||
    context.pendingCount > 0);

export const PENDING_LIMIT_CHANGE_REQUESTS_COUNT_KEY =
  'pending-limit-change-requests-count';

/** The current user's pending request on a resource, shared by action and dialog. */
export const ownPendingLimitChangeRequestsQuery = (
  resourceUuid: string,
  userUuid: string,
) => ({
  queryKey: ['resource-limit-change-requests', resourceUuid, userUuid],
  queryFn: () =>
    marketplaceResourceLimitChangeRequestsList({
      query: {
        resource_uuid: resourceUuid,
        state: ['pending'],
        created_by_uuid: userUuid,
      },
    }).then((response) => (Array.isArray(response.data) ? response.data : [])),
});
