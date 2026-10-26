import classNames from 'classnames';
import { FC } from 'react';

import { Avatar, Badge } from 'waldur-ui';

import { translate } from '@/i18n';

import { getChatAvatarClass } from './chatColors';
import { useRoomMembers } from './useRoomMembers';

function getRoleBadge(powerLevel: number) {
  if (powerLevel >= 100)
    return { label: translate('Bot'), variant: 'secondary' as const };
  if (powerLevel >= 50)
    return { label: translate('Admin'), variant: 'success' as const };
  return null;
}

export const MatrixMembersList: FC = () => {
  const members = useRoomMembers();

  return (
    <div className="tc-members p-3">
      <div className="mb-2">
        {translate('Members')} ({members.length})
      </div>
      <div className="flex flex-col gap-1">
        {members.map((m) => {
          const roleBadge = getRoleBadge(m.powerLevel);
          const invited = m.membership === 'invite';
          return (
            <div
              key={m.userId}
              className={classNames(
                'flex items-center gap-2 py-1',
                invited && 'opacity-50',
              )}
            >
              <Avatar
                name={m.name}
                src={m.image}
                size={24}
                className="shrink-0"
                fallbackClassName={getChatAvatarClass(m.userId)}
              />
              <span className="truncate grow">{m.name}</span>
              {roleBadge && (
                <Badge
                  variant={roleBadge.variant}
                  size="sm"
                  shape="pill"
                  tone="outline"
                >
                  {roleBadge.label}
                </Badge>
              )}
              {invited && (
                <Badge variant="warning" size="sm" shape="pill" tone="outline">
                  {translate('Invited')}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
