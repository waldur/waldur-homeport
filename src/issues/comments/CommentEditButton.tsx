import { PencilSimpleIcon } from '@phosphor-icons/react';
import { FC, useContext } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactSubmitButton } from '@/form/CompactSubmitButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { IssueCommentsContext } from './IssueCommentsContext';
import { Comment } from './types';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

interface CommentEditButtonProps {
  comment: Comment;
}

export const CommentEditButton: FC<CommentEditButtonProps> = ({ comment }) => {
  const { openDialog } = useModal();
  const issue = useContext(IssueCommentsContext);

  const openEditCommentDialog = () => {
    openDialog(CommentFormDialog, {
      resolve: { comment, issue },
      size: 'sm',
    });
  };

  return (
    <CompactSubmitButton
      submitting={false}
      type="button"
      variant="tertiary"
      className="me-3"
      disabled={!comment.update_is_available}
      onClick={openEditCommentDialog}
      label={translate('Change')}
      iconNode={<PencilSimpleIcon weight="bold" />}
    />
  );
};
