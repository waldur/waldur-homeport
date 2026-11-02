interface UserWithPermissions {
  permissions?: ReadonlyArray<{ scope_type?: string | null }> | null;
}

/**
 * Whether the user holds a role on anything at all.
 *
 * Every scope type the backend reports — organization, project, resource,
 * offering, service provider, call, call organiser, proposal — is a role that
 * gives the user something to work on, so none is singled out. An allow-list
 * of "real" scope types would tell a call reviewer or an offering manager they
 * have no access, and would do the same to the next scope type added.
 */
export const hasAnyRole = (user: UserWithPermissions | null | undefined) =>
  Boolean(user?.permissions?.some((permission) => permission?.scope_type));
