import { PlusIcon } from '@phosphor-icons/react';
import { FC, useContext } from 'react';

import { BaseButton } from 'waldur-ui';

import { lazyComponent } from '@/core/lazyComponent';
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
    <BaseButton
      variant="secondary"
      disabled={uiDisabled}
      disabledReason={
        uiDisabled ? translate('Adding comments is not available') : undefined
      }
      onClick={openCommentDialog}
      label={translate('Add comment')}
      iconNode={<PlusIcon weight="bold" />}
      size="lg"
    />
  );
};
