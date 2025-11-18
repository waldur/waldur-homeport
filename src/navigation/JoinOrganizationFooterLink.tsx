import { GlobeSimpleIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';

import { count } from '@waldur/core/api';
import { Link } from '@waldur/core/Link';
import { translate } from '@waldur/i18n';

export const JoinOrganizationFooterLink = ({ loginPage = false }) => {
  const { data: publicGroupInvitationsCount } = useQuery({
    queryKey: ['publicGroupInvitationsCount'],
    queryFn: () =>
      count('/api/user-group-invitations/', {
        is_public: true,
        is_active: true,
      }),
  });

  if (!publicGroupInvitationsCount) return null;

  return (
    <li className="menu-item" data-kt-menu-trigger="click">
      <Link
        className="menu-link text-anchor px-8px"
        state="public.join-organization"
      >
        <span className="menu-icon">
          <GlobeSimpleIcon weight={loginPage ? undefined : 'bold'} size={20} />
        </span>
        <span className="menu-title">
          {loginPage
            ? translate('Join public organization')
            : translate('Join organization')}
        </span>
      </Link>
    </li>
  );
};
