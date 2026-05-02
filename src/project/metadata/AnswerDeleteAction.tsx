import { XCircleIcon } from '@phosphor-icons/react';
import { projectsSubmitAnswers, QuestionAdmin } from 'waldur-js-client';

import { formatJsxTemplate, translate } from '@/i18n';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { RemovalActionItem } from '@/resource/actions/RemovalActionItem';

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
  const { mutate, isPending } = useManagedMutation<any, any, void>({
    mutationFn: () =>
      projectsSubmitAnswers({
        path: { uuid: projectUuid },
        body: [{ question_uuid: question.uuid, answer_data: null }],
      }),
    refetch,
    confirmation: {
      title: translate('Delete answer'),
      body: translate(
        'You are going to delete answer for the question {question}. This action cannot be undone.',
        { question: <b>{question.description}</b> },
        formatJsxTemplate,
      ),
      options: {
        forDeletion: true,
        size: 'sm',
        iconNode: <XCircleIcon weight="bold" />,
      },
    },
    errorMessage: translate('Unable to delete answer.'),
  });

  return (
    <RemovalActionItem
      title={translate('Delete')}
      action={mutate}
      disabled={isPending}
    />
  );
};
