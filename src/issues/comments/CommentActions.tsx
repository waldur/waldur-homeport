import { FC } from 'react';

import { CommentDeleteButton } from './CommentDeleteButton';
import { CommentEditButton } from './CommentEditButton';
import { Comment } from './types';

// The API answers both flags for the current user: staff, or the author where
// the support backend lets authors change their comments, and only while the
// backend still accepts the change. Nothing to offer means nothing to show.
export const CommentActions: FC<{ comment: Comment }> = ({ comment }) => (
  <div className="flex-shrink-0 mt-5">
    {comment.update_is_available && <CommentEditButton comment={comment} />}
    {comment.destroy_is_available && <CommentDeleteButton comment={comment} />}
  </div>
);
