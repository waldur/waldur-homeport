import { PhoneIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Avatar, Badge, cn, Tooltip } from 'waldur-ui';

import { RoomCallState } from './call/useAllRoomCallStates';
import { getChatAvatarClass } from './chatColors';

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
  const isUnread = unreadCount > 0;

  return (
    <Tooltip label={name} side="right">
      <button
        type="button"
        aria-label={name}
        onClick={onClick}
        className={cn(
          'relative flex p-1 border-0 rounded-lg bg-transparent cursor-pointer transition-colors hover:bg-secondary',
          active &&
            'bg-[var(--bg-brand-secondary)] hover:bg-[var(--bg-brand-secondary)]',
        )}
      >
        <Avatar
          name={name}
          size={32}
          shape="square"
          fallbackClassName={getChatAvatarClass(uuid)}
        />
        {activeCall && (
          <span
            data-testid="rail-call-indicator"
            className="absolute bottom-0 right-0 inline-flex items-center justify-center size-3.5 rounded-full bg-primary text-success"
            aria-hidden
          >
            <PhoneIcon size={10} weight="fill" />
          </span>
        )}
        {isUnread && (
          <Badge
            variant={mentionCount > 0 ? 'danger' : 'primary'}
            size="sm"
            className="absolute top-0 right-0 min-w-6 tabular-nums"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </button>
    </Tooltip>
  );
};
