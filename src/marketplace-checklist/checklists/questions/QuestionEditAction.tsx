import { FC } from 'react';
import { QuestionAdmin } from 'waldur-js-client';

import { EditModalButton } from '@waldur/core/buttons';
import { lazyComponent } from '@waldur/core/lazyComponent';
import { QUESTION_FORM_ID } from '@waldur/marketplace-checklist/constants';

const QuestionFormDialog = lazyComponent(() =>
  import('./QuestionFormDialog').then((module) => ({
    default: module.QuestionFormDialog,
  })),
);

interface QuestionEditActionProps {
  row: QuestionAdmin;
}

export const QuestionEditAction: FC<QuestionEditActionProps> = ({ row }) => (
  <EditModalButton
    dialog={QuestionFormDialog}
    row={row}
    buildResolve={(r) => ({
      question: r,
      checklist: {
        uuid: r.checklist_uuid,
        name: r.checklist_name,
        url: r.checklist,
      },
    })}
    getInitialValues={(r) => ({
      description: r.description,
      question_type: r.question_type,
      required: r.required || false,
      review_answer_value: r.review_answer_value as any,
      options: r.question_options.map((opt) => opt.label),
      min_value: r.min_value,
      max_value: r.max_value,
      dependency_logic_operator: r.dependency_logic_operator,
    })}
    size="lg"
    formId={QUESTION_FORM_ID}
  />
);
