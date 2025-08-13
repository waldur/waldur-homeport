import { PlusSquareIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Checklist } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

import { QUESTION_FORM_ID } from '../constants';

const QuestionFormDialog = lazyComponent(() =>
  import('./questions/QuestionFormDialog').then((module) => ({
    default: module.QuestionFormDialog,
  })),
);

interface AddQuestionActionProps {
  row: Checklist;
}

export const AddQuestionAction: FC<AddQuestionActionProps> = ({ row }) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(QuestionFormDialog, {
      resolve: { checklist: row },
      size: 'lg',
      formId: QUESTION_FORM_ID,
    });
  }, [row]);

  return (
    <ActionItem
      title={translate('Add question')}
      action={callback}
      iconNode={<PlusSquareIcon weight="bold" />}
    />
  );
};
