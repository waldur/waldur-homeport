import { Link } from '@waldur/core/Link';

export const InvitationScopeLink = ({ row }) =>
  row.scope_type === 'customer' ? (
    <Link
      state="organization.dashboard"
      params={{ uuid: row.scope_uuid }}
      label={row.scope_name}
    />
  ) : row.scope_type === 'project' ? (
    <Link
      state="project.dashboard"
      params={{ uuid: row.scope_uuid }}
      label={row.scope_name}
    />
  ) : row.scope_type === 'offering' ? (
    <Link
      state="admin-marketplace-offering-details"
      params={{ offering_uuid: row.scope_uuid }}
      label={row.scope_name}
    />
  ) : row.scope_type === 'call' ? (
    <Link
      state="public-call.details"
      params={{ call_uuid: row.scope_uuid }}
      label={row.scope_name}
    />
  ) : (
    row.scope_name
  );
