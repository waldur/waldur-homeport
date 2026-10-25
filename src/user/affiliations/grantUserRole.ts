import {
  callManagingOrganisationsAddUser,
  customersAddUser,
  globalUserRolesCreate,
  GlobalUserRoleCreateRequest,
  marketplaceProviderOfferingsAddUser,
  marketplaceServiceProvidersAddUser,
  projectsAddUser,
  proposalProposalsAddUser,
  proposalProtectedCallsAddUser,
  UserRoleCreateRequest,
} from 'waldur-js-client';

/**
 * There is no single create on user-permissions (that endpoint only lists,
 * revokes and restores). Each scope still grants through its own add_user.
 */
const GRANT_BY_SCOPE = {
  customer: customersAddUser,
  project: projectsAddUser,
  offering: marketplaceProviderOfferingsAddUser,
  call: proposalProtectedCallsAddUser,
  proposal: proposalProposalsAddUser,
  service_provider: marketplaceServiceProvidersAddUser,
  call_organizer: callManagingOrganisationsAddUser,
} as const;

export type GrantableScopeType = keyof typeof GRANT_BY_SCOPE;

export const isGrantableScopeType = (
  scopeType: string,
): scopeType is GrantableScopeType =>
  Object.prototype.hasOwnProperty.call(GRANT_BY_SCOPE, scopeType);

/** A site-wide role has no scope to pick: there is one site. Staff only. */
export const grantSiteRole = (body: GlobalUserRoleCreateRequest) =>
  globalUserRolesCreate({ body });

export const grantUserRole = (
  scopeType: GrantableScopeType,
  scopeUuid: string,
  body: UserRoleCreateRequest,
) => GRANT_BY_SCOPE[scopeType]({ path: { uuid: scopeUuid }, body });
