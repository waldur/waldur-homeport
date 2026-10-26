import { FC } from 'react';

import { Avatar } from 'waldur-ui';

import { translate } from '@/i18n';

import { getChatAvatarClass } from './chatColors';

interface TypingUser {
  userId: string;
  name: string;
}

interface MatrixTypingIndicatorProps {
  typingUsers: TypingUser[];
  /** Live Waldur avatars keyed by Matrix user ID. */
  memberImages?: Map<string, string>;
}

export const MatrixTypingIndicator: FC<MatrixTypingIndicatorProps> = ({
  typingUsers,
  memberImages,
}) => {
  if (typingUsers.length === 0) return null;

  let text: string;
  if (typingUsers.length === 1) {
    text = translate('{user} is typing...', { user: typingUsers[0].name });
  } else if (typingUsers.length === 2) {
    text = translate('{user1} and {user2} are typing...', {
      user1: typingUsers[0].name,
      user2: typingUsers[1].name,
    });
  } else {
    text = translate('Several people are typing...');
  }

  return (
    <div className="tc-typing">
      <div className="tc-typing__avatars">
        {typingUsers.slice(0, 3).map((u) => (
          <Avatar
            key={u.userId}
            name={u.name}
            src={memberImages?.get(u.userId)}
            size={20}
            fallbackClassName={getChatAvatarClass(u.userId)}
          />
        ))}
      </div>
      <span className="tc-typing__dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className="visually-hidden">{text}</span>
    </div>
  );
};
