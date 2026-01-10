import { useCallback } from 'react';
import { Answer, Project, QuestionWithAnswer } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { CompactEditButton } from '@waldur/form/CompactEditButton';
import { translate } from '@waldur/i18n';
import { useModal } from '@waldur/modal/hooks';

const AnswerFormDialog = lazyComponent(() =>
  import('@waldur/marketplace-checklist/AnswerFormDialog').then((module) => ({
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

  return <CompactEditButton onClick={callback} />;
};
