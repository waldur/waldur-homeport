import { FC, useCallback } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { useModal } from '@waldur/modal/hooks';

const AnswerFormDialog = lazyComponent(() =>
  import('@waldur/marketplace-checklist/AnswerFormDialog').then((module) => ({
    default: module.AnswerFormDialog,
  })),
);

interface AnswerEditActionProps {
  row: Answer;
  question: QuestionAdmin;
  projectUuid: string;
  refetch?(): void;
}

export const AnswerEditAction: FC<AnswerEditActionProps> = ({
  row,
  question,
  projectUuid,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(AnswerFormDialog, {
      resolve: {
        answer: row,
        question,
        projectUuid,
        refetch,
      },
      size: 'sm',
    });
  }, [row]);

  return <EditAction action={callback} />;
};
