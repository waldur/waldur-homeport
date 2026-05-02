import { PlusIcon } from '@phosphor-icons/react';
import { FC, useContext } from 'react';

import { lazyComponent } from '@/core/lazyComponent';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';

import { IssueCommentsContext } from './IssueCommentsContext';

const CommentFormDialog = lazyComponent(() =>
  import('./CommentFormDialog').then((module) => ({
    default: module.CommentFormDialog,
  })),
);

export const IssueCommentButton: FC = () => {
  const { openDialog } = useModal();
  const issue = useContext(IssueCommentsContext);
  const uiDisabled = !issue?.add_comment_is_available;

  const openCommentDialog = () => {
    openDialog(CommentFormDialog, { resolve: { issue }, size: 'sm' });
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
