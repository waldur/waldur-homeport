import { FC } from 'react';

import { translate } from '@/i18n';

interface MatrixTypingIndicatorProps {
  typingUsers: string[];
}

export const MatrixTypingIndicator: FC<MatrixTypingIndicatorProps> = ({
  typingUsers,
}) => {
  if (typingUsers.length === 0) return null;

  let text: string;
  if (typingUsers.length === 1) {
    text = translate('{user} is typing...', { user: typingUsers[0] });
  } else if (typingUsers.length === 2) {
    text = translate('{user1} and {user2} are typing...', {
      user1: typingUsers[0],
      user2: typingUsers[1],
    });
  } else {
    text = translate('Several people are typing...');
  }

  return (
    <div className="px-4 py-1 text-muted" style={{ fontSize: '0.75rem' }}>
      <em>{text}</em>
    </div>
  );
};
