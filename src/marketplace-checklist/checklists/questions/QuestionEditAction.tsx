import { FC, useCallback } from 'react';
import { QuestionAdmin } from 'waldur-js-client';

import { lazyComponent } from '@waldur/core/lazyComponent';
import { EditAction } from '@waldur/form/EditAction';
import { QUESTION_FORM_ID } from '@waldur/marketplace-checklist/constants';
import { useModal } from '@waldur/modal/hooks';

const QuestionFormDialog = lazyComponent(() =>
  import('./QuestionFormDialog').then((module) => ({
    default: module.QuestionFormDialog,
  })),
);

interface QuestionEditActionProps {
  row: QuestionAdmin;
}

export const QuestionEditAction: FC<QuestionEditActionProps> = ({ row }) => {
  const { openDialog } = useModal();
  const callback = useCallback(() => {
    openDialog(QuestionFormDialog, {
      resolve: {
        question: row,
        checklist: {
          uuid: row.checklist_uuid,
          name: row.checklist_name,
          url: row.checklist,
        },
      },
      initialValues: {
        description: row.description,
        question_type: row.question_type,
        required: row.required || false,
        review_answer_value: row.review_answer_value as any,
        options: row.question_options.map((opt) => opt.label),
        min_value: row.min_value,
        max_value: row.max_value,
        dependency_logic_operator: row.dependency_logic_operator,
      },
      size: 'lg',
      formId: QUESTION_FORM_ID,
    });
  }, [row]);

  return <EditAction action={callback} />;
};
