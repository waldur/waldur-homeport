import { customersRetrieve, projectsRetrieve } from 'waldur-js-client';

import { Customer, Project } from '@/workspace/types';

export interface StoredScope {
  organization?: Pick<Customer, 'name' | 'uuid' | 'abbreviation'> | null;
  project?: Pick<
    Project,
    'name' | 'uuid' | 'url' | 'customer_uuid' | 'is_industry'
  > | null;
}

/**
 * Whether the failure says the object is not there for this user.
 *
 * 404 covers both halves of the problem: the object was deleted, and the user
 * lost the membership that made it visible — DRF scopes the queryset first, so
 * an inaccessible object is missing rather than forbidden.
 *
 * Nothing else counts. Offline, a 5xx, an expired token: none of those are
 * evidence of absence, and treating them as such would let one bad request
 * silently discard a scope the user chose deliberately.
 *
 * Both error shapes appear in this codebase depending on where the SDK throws;
 * see src/user/organization-create/utils.ts, which checks the same pair.
 */
const isMissing = (error: any): boolean =>
  error?.status === 404 || error?.response?.status === 404;

const stillResolves = async (retrieve: () => Promise<unknown>) => {
  try {
    await retrieve();
    return true;
  } catch (error) {
    return !isMissing(error);
  }
};

/**
 * Drops the parts of a restored workspace scope that no longer resolve.
 *
 * The scope is persisted as a snapshot — uuid and name, captured when the user
 * picked it — and replayed on every load. The organisation or project it names
 * can be deleted, or the user removed from it, at any point afterwards, and
 * nothing downstream notices: the list endpoints answer an unknown
 * `allowed_customer_uuid` with an empty page rather than an error, which is
 * indistinguishable from a deployment that has no offerings. The user is left
 * with an empty catalog and a filter they cannot see in order to remove it.
 *
 * Returns the input unchanged — the same reference, so callers can skip the
 * write entirely — whenever there is nothing to prune, including the common
 * case of no stored scope at all, which costs no requests.
 */
export const pruneMissingScope = async <T extends StoredScope>(
  scope: T,
): Promise<T> => {
  const organizationUuid = scope?.organization?.uuid;
  const projectUuid = scope?.project?.uuid;
  if (!organizationUuid && !projectUuid) return scope;

  const [organizationLives, projectLives] = await Promise.all([
    organizationUuid
      ? stillResolves(() =>
          customersRetrieve({
            path: { uuid: organizationUuid },
            query: { field: ['uuid'] },
          }),
        )
      : true,
    projectUuid
      ? stillResolves(() =>
          projectsRetrieve({
            path: { uuid: projectUuid },
            query: { field: ['uuid'] },
          }),
        )
      : true,
  ]);

  if (organizationLives && projectLives) return scope;
  // A project is only meaningful under its organisation, so an organisation
  // that is gone takes the project with it rather than leaving a project
  // filter hanging under an organisation the UI can no longer name.
  if (!organizationLives)
    return { ...scope, organization: null, project: null };
  return { ...scope, project: null };
};
