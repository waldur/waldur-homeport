import { useUser } from '@/workspace/hooks';

import { CommentDeleteButton } from './CommentDeleteButton';
import { CommentEditButton } from './CommentEditButton';

export const CommentActions = ({ comment }) => {
  const user = useUser();

  return (
    <div className="flex-shrink-0 mt-5">
      {(user.is_staff || user.uuid === comment.author_uuid) && (
        <>
          <CommentEditButton comment={comment} />
          <CommentDeleteButton comment={comment} />
        </>
      )}
    </div>
  );
};
