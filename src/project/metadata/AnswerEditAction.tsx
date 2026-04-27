import { FC, useCallback } from 'react';
import { Answer, QuestionAdmin } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { EditAction } from '@/form/EditAction';
import { useModal } from '@/modal/hooks';

const AnswerFormDialog = lazyComponent(() =>
  import('@/marketplace-checklist/AnswerFormDialog').then((module) => ({
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
