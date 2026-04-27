import { useCallback } from 'react';
import { Answer, Project, QuestionWithAnswer } from 'waldur-js-client';

import { lazyComponent } from '@/core/lazyComponent';
import { CompactEditButton } from '@/form/CompactEditButton';
import { translate } from '@/i18n';
import { useModal } from '@/modal/hooks';

const AnswerFormDialog = lazyComponent(() =>
  import('@/marketplace-checklist/AnswerFormDialog').then((module) => ({
    default: module.AnswerFormDialog,
  })),
);

export const MetadataEditButton = ({
  project,
  question,
  refetch,
}: {
  project: Project;
  question: QuestionWithAnswer;
  refetch?(): void;
}) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(AnswerFormDialog, {
      resolve: {
        answer: question.existing_answer as Answer,
        question: question as any,
        projectUuid: project.uuid,
        title: translate('Project metadata'),
        refetch,
      },
      size: 'sm',
    });
  }, [project, question]);

  return <CompactEditButton onClick={callback} variant="secondary" />;
};
