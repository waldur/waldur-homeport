import { PhoneIcon } from '@phosphor-icons/react';
import classNames from 'classnames';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

import Avatar from '@/core/Avatar';

import { RoomCallState } from './call/useAllRoomCallStates';
import { getChatAvatarColor } from './chatColors';

interface MatrixRoomRailItemProps {
  uuid: string;
  name: string;
  unreadCount: number;
  mentionCount: number;
  activeCall: RoomCallState | null;
  active?: boolean;
  onClick: () => void;
}

/**
 * One room in the collapsed team-chat rail: an avatar-only quick-switch
 * button. The room name is exposed via the hover tooltip and `aria-label`.
 */
export const MatrixRoomRailItem: FC<MatrixRoomRailItemProps> = ({
  uuid,
  name,
  unreadCount,
  mentionCount,
  activeCall,
  active,
  onClick,
}) => {
  const color = getChatAvatarColor(uuid);
  const isUnread = unreadCount > 0;

  return (
    <Tooltip label={name} side="right">
      <button
        type="button"
        aria-label={name}
        onClick={onClick}
        className={classNames('tc-rail-item', { active })}
      >
        <Avatar
          name={name}
          size={32}
          labelClassName={`bg-light-${color} text-${color}`}
        />
        {activeCall && (
          <span className="tc-rail-call text-success" aria-hidden>
            <PhoneIcon size={10} weight="fill" />
          </span>
        )}
        {isUnread && (
          <span
            className={classNames('tc-badge tc-rail-badge', {
              mention: mentionCount > 0,
            })}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
    </Tooltip>
  );
};
