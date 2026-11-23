import { FC, useMemo } from 'react';

import { translate } from '@/i18n';
import { QuestionForm } from '@/marketplace-checklist/checklists/questions/QuestionForm';
import { ChecklistQuestionForm } from '@/marketplace-checklist/types';
import { ModalShell } from '@/modal/ModalShell';

import {
  fromQuestionFormValues,
  toQuestionFormValues,
  toVisibilityQuestions,
} from './localQuestions';
import { LocalQuestion } from './types';

interface LocalQuestionDialogProps {
  question?: LocalQuestion;
  siblings: LocalQuestion[];
  onSave(question: LocalQuestion): void;
  onHide(): void;
}

const NEW_QUESTION = { option_keys: [] } as ChecklistQuestionForm;

// Rendered in place on the confirm layer: the app has one openDialog slot, and
// the survey wizard already holds it.
export const LocalQuestionDialog: FC<LocalQuestionDialogProps> = ({
  question,
  siblings,
  onSave,
  onHide,
}) => {
  // A new object would make react-final-form reset the form on every render
  // of the wizard.
  const initialValues = useMemo(
    () => (question ? toQuestionFormValues(question) : NEW_QUESTION),
    [question],
  );
  const visibilityQuestions = useMemo(
    () => toVisibilityQuestions(siblings, question?.key),
    [siblings, question?.key],
  );
  const isEdit = Boolean(question);

  return (
    <ModalShell open layer="confirm" onHide={onHide} size="lg">
      <QuestionForm
        title={isEdit ? translate('Edit question') : translate('Add question')}
        initialValues={initialValues}
        isEdit={isEdit}
        onSubmit={(values) => {
          onSave(fromQuestionFormValues(values, question));
          return Promise.resolve(true);
        }}
        onDone={onHide}
        visibilityQuestions={visibilityQuestions}
        local
      />
    </ModalShell>
  );
};
