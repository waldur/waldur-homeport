import { TrashIcon, XCircleIcon } from '@phosphor-icons/react';
import { useDispatch } from 'react-redux';
import { projectsSubmitAnswers, QuestionAdmin } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { waitForConfirmation } from '@/modal/actions';
import { ActionItem } from '@/resource/actions/ActionItem';

interface AnswerDeleteActionProps {
  question: QuestionAdmin;
  projectUuid: string;
  refetch?(): void;
}

export const AnswerDeleteAction = ({
  question,
  projectUuid,
  refetch,
}: AnswerDeleteActionProps) => {
  const dispatch = useDispatch();
  const openDialog = async () => {
    try {
      await waitForConfirmation(
        dispatch,
        translate('Delete answer'),
        translate(
          'You are going to delete answer for the question {question}. This action cannot be undone.',
          { question: <b>{question.description}</b> },
          formatJsxTemplate,
        ),
        {
          forDeletion: true,
          size: 'sm',
          iconNode: <XCircleIcon weight="bold" />,
        },
      );
    } catch {
      return;
    }
    await projectsSubmitAnswers({
      path: { uuid: projectUuid },
      body: [{ question_uuid: question.uuid, answer_data: null }],
    });
    await refetch();
  };
  return (
    <ActionItem
      title={translate('Delete')}
      action={openDialog}
      iconNode={<TrashIcon weight="bold" />}
      className="text-danger"
      iconColor="danger"
    />
  );
};
