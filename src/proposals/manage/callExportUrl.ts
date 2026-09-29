import { Call } from '../types';

/** `organization_uuid` is absent on purpose: one call's proposals all share a
 * managing organisation, so it cannot discriminate here. */
export interface CallExportFilter {
  round_uuid?: string;
  state?: string[];
  created_by_uuid?: string;
  reviewer_uuid?: string;
  proposal_uuid?: string;
}

const UUID_FILTERS = [
  'round_uuid',
  'created_by_uuid',
  'reviewer_uuid',
  'proposal_uuid',
] as const;

/** State and name go out prefixed: the endpoint resolves the call through the
 * call list's filterset, which would read a bare `state` or `name` as its own. */
export const buildCallExportUrl = (
  call: Pick<Call, 'url'>,
  action: 'export-proposals' | 'export-reviews',
  stateParameter: 'proposal_state' | 'review_state',
  filter?: CallExportFilter,
  search?: string,
): string => {
  const query = new URLSearchParams();
  UUID_FILTERS.filter((key) => filter?.[key]).forEach((key) =>
    query.set(key, filter[key] as string),
  );
  filter?.state?.forEach((state) => query.append(stateParameter, state));
  if (search) {
    query.set('proposal_name', search);
  }
  const queryString = query.toString();
  return `${call.url}${action}/${queryString ? `?${queryString}` : ''}`;
};
