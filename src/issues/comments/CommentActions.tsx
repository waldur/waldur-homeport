import { FC } from 'react';

import { CommentDeleteButton } from './CommentDeleteButton';
import { CommentEditButton } from './CommentEditButton';
import { Comment } from './types';

// The API answers both flags for the current user: staff, or the author where
// the support backend lets authors change their comments, and only while the
// backend still accepts the change. Nothing to offer means nothing to show.
export const CommentActions: FC<{ comment: Comment }> = ({ comment }) => {
  if (!comment.update_is_available && !comment.destroy_is_available) {
    return null;
  }
  return (
    <div className="flex items-center flex-wrap gap-1.5 shrink-0">
      {comment.update_is_available && <CommentEditButton comment={comment} />}
      {comment.destroy_is_available && (
        <CommentDeleteButton comment={comment} />
      )}
    </div>
  );
};
