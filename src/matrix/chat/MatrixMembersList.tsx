import classNames from 'classnames';
import { FC } from 'react';

import Avatar from '@/core/Avatar';
import { Badge } from '@/core/Badge';
import { translate } from '@/i18n';

import { getChatAvatarColor } from './chatColors';
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
      <div className="fw-semibold mb-2">
        {translate('Members')} ({members.length})
      </div>
      <div className="d-flex flex-column gap-1">
        {members.map((m) => {
          const roleBadge = getRoleBadge(m.powerLevel);
          const invited = m.membership === 'invite';
          const color = getChatAvatarColor(m.userId);
          return (
            <div
              key={m.userId}
              className={classNames(
                'd-flex align-items-center gap-2 py-1',
                invited && 'opacity-50',
              )}
            >
              <Avatar
                name={m.name}
                src={m.image}
                size={24}
                circle
                className="flex-shrink-0"
                labelClassName={`bg-light-${color} text-${color}`}
              />
              <span className="text-truncate flex-grow-1">{m.name}</span>
              {roleBadge && (
                <Badge variant={roleBadge.variant} size="sm" pill outline>
                  {roleBadge.label}
                </Badge>
              )}
              {invited && (
                <Badge variant="warning" size="sm" pill outline>
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
