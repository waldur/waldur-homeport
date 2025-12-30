import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react';
import { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { openModalDialog, waitForConfirmation } from '@waldur/modal/actions';
import { getUser } from '@waldur/workspace/selectors';

import { useDeleteComment } from './api';
import { IssueCommentsContext } from './IssueCommentsContext';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

export const CommentActions = ({ comment }) => {
  const dispatch = useDispatch();
  const issue = useContext(IssueCommentsContext);
  const deleteComment = useDeleteComment(issue.url);

  const user = useSelector(getUser);

  const openEditCommentDialog = () => {
    dispatch(
      openModalDialog(CommentFormDialog, {
        resolve: { comment, issue },
        size: 'sm',
      }),
    );
  };

  const openDeleteDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete comment'),
        translate(
          'Are you sure you want to delete this comment? This action cannot be undone.',
        ),
        { forDeletion: true },
      );
    } catch {
      return;
    }
    deleteComment.mutate(comment.uuid);
  };

  return (
    <div className="flex-shrink-0 mt-5">
      {(user.is_staff || user.uuid === comment.author_uuid) && (
        <>
          <Button
            variant="tertiary"
            size="sm"
            className="btn-icon-right me-3"
            disabled={!comment.update_is_available}
            onClick={openEditCommentDialog}
          >
            {translate('Change')}
            <span className="svg-icon svg-icon-5">
              <PencilSimpleIcon weight="bold" />
            </span>
          </Button>
          <Button
            variant="tertiary"
            size="sm"
            className="btn-icon-right"
            disabled={!comment.destroy_is_available || deleteComment.isPending}
            onClick={openDeleteDialog}
          >
            {translate('Remove')}
            <span className="svg-icon svg-icon-5">
              <TrashIcon weight="bold" />
            </span>
          </Button>
        </>
      )}
    </div>
  );
};
