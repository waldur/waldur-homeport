import { FC } from 'react';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

import type { RmqStatsUser } from './api';

interface UserLinkProps {
  user: RmqStatsUser | null;
}

export const UserLink: FC<UserLinkProps> = ({ user }) => {
  if (!user) {
    return <span className="text-muted">{translate('Unknown user')}</span>;
  }

  return (
    <Link state="support-user-manage" params={{ user_uuid: user.uuid }}>
      {user.full_name || user.username}
    </Link>
  );
};
