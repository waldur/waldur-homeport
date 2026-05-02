import { TrashIcon } from '@phosphor-icons/react';
import { FC, useContext } from 'react';
import { supportCommentsDestroy } from 'waldur-js-client';

import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { ISSUE_COMMENTS_QUERY_KEY } from './constants';
import { IssueCommentsContext } from './IssueCommentsContext';
import { Comment } from './types';

interface CommentDeleteButtonProps {
  comment: Comment;
}

export const CommentDeleteButton: FC<CommentDeleteButtonProps> = ({
  comment,
}) => {
  const issue = useContext(IssueCommentsContext);

  const deleteComment = useManagedMutation({
    mutationFn: () => supportCommentsDestroy({ path: { uuid: comment.uuid } }),
    invalidateQueries: [{ queryKey: [ISSUE_COMMENTS_QUERY_KEY, issue.url] }],
    errorMessage: translate('Unable to delete comment.'),
    confirmation: {
      title: translate('Delete comment'),
      body: translate(
        'Are you sure you want to delete this comment? This action cannot be undone.',
      ),
      options: { forDeletion: true },
    },
  });

  return (
    <CompactSubmitButton
      submitting={deleteComment.isPending}
      type="button"
      variant="tertiary"
      disabled={!comment.destroy_is_available || deleteComment.isPending}
      onClick={() => deleteComment.mutate()}
      label={translate('Remove')}
      iconNode={<TrashIcon weight="bold" />}
    />
  );
};
