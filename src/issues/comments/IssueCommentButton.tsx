import { PlusIcon } from '@phosphor-icons/react';
import { FC, useContext } from 'react';
import { useDispatch } from 'react-redux';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { openModalDialog } from '@waldur/modal/actions';

import { IssueCommentsContext } from './IssueCommentsContext';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

export const IssueCommentButton: FC = () => {
  const dispatch = useDispatch();
  const issue = useContext(IssueCommentsContext);
  const uiDisabled = !issue?.add_comment_is_available;

  const openCommentDialog = () => {
    dispatch(
      openModalDialog(CommentFormDialog, { resolve: { issue }, size: 'sm' }),
    );
  };

  return (
    <SubmitButton
      submitting={false}
      type="button"
      variant="secondary"
      disabled={uiDisabled}
      onClick={openCommentDialog}
      label={translate('Add comment')}
      iconNode={<PlusIcon weight="bold" />}
      iconOnLeft
    />
  );
};
