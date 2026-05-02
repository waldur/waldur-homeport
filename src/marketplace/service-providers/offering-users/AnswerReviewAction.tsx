import { EyeIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Answer, QuestionWithAnswer } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

const AnswerReviewDialog = lazyComponent(() =>
  import('./AnswerReviewDialog').then((module) => ({
    default: module.AnswerReviewDialog,
  })),
);

interface AnswerReviewActionProps {
  row: Answer;
  question: QuestionWithAnswer;
  offeringUserUuid: string;
  refetch?(): void;
}

export const AnswerReviewAction: FC<AnswerReviewActionProps> = ({
  row,
  question,
  offeringUserUuid,
  refetch,
}) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(AnswerReviewDialog, {
      resolve: {
        answer: row,
        question,
        offeringUserUuid,
        refetch,
      },
    });
  }, [row]);

  return (
    <ActionItem
      action={callback}
      title={translate('Review')}
      iconNode={<EyeIcon weight="bold" />}
    />
  );
};
