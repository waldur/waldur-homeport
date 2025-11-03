import { EyeIcon } from '@phosphor-icons/react';
import { FC, useCallback } from 'react';
import { Answer, QuestionWithAnswer } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';
import { ActionItem } from '@waldur/resource/actions/ActionItem';

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
