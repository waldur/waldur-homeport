import { Link } from '@waldur/core/Link';

import { getInvitationLinkProps } from './getInvitationLinkProps';

export const InvitationScopeLink = ({ row }) => {
  const linkProps = getInvitationLinkProps(row);
  return linkProps ? (
    <Link {...linkProps} label={row.scope_name} />
  ) : (
    row.scope_name
  );
};
