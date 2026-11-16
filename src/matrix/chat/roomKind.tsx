import { ChatsCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Avatar, cn } from 'waldur-ui';

import { getChatAvatarClass } from './chatColors';

/** A step discussion's room, as the backend's `scope_type` names it. */
export const DISCUSSION_ROOM = 'step_discussion';

export const isDiscussionRoom = (scopeType?: string | null) =>
  scopeType === DISCUSSION_ROOM;

/**
 * How a room reads in a list. A discussion room's name is "<call> · <subtitle>"
 * (the step, and the proposal or round and panel): the subtitle names it,
 * and the call goes on the line beside its badge.
 */
export const roomTitle = (
  name: string,
  scopeType?: string | null,
  scopeSubtitle?: string | null,
): { title: string; context?: string } => {
  if (!isDiscussionRoom(scopeType) || !scopeSubtitle) return { title: name };
  const suffix = ` · ${scopeSubtitle}`;
  return name.endsWith(suffix)
    ? { title: scopeSubtitle, context: name.slice(0, -suffix.length) }
    : { title: name, context: scopeSubtitle };
};

const SIZE_CLASSES = { 32: 'size-8', 40: 'size-10', 48: 'size-12' } as const;

/**
 * A room's avatar: the initials of its name, or for a step discussion a
 * discussion icon, so it never reads as one more project room.
 */
export const RoomAvatar: FC<{
  uuid: string;
  name: string;
  scopeType?: string | null;
  size: keyof typeof SIZE_CLASSES;
  shape?: 'circle' | 'square';
}> = ({ uuid, name, scopeType, size, shape }) =>
  isDiscussionRoom(scopeType) ? (
    <span
      data-testid="room-avatar-discussion"
      aria-hidden
      className={cn(
        'inline-flex shrink-0 items-center justify-center bg-brand-subtle text-brand',
        SIZE_CLASSES[size],
        shape === 'square' ? 'rounded-lg' : 'rounded-full',
      )}
    >
      <ChatsCircleIcon size={Math.round(size * 0.55)} weight="duotone" />
    </span>
  ) : (
    <Avatar
      name={name}
      size={size}
      shape={shape}
      fallbackClassName={getChatAvatarClass(uuid)}
    />
  );
