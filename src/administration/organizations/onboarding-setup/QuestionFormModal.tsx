import arrayMutators from 'final-form-arrays';
import { FC } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Form } from 'react-final-form';

import { translate } from '@waldur/i18n';
import { QuestionGeneralForm } from '@waldur/marketplace-checklist/checklists/questions/QuestionGeneralForm';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { PredefinedQuestion } from './predefinedQuestions';

interface QuestionFormModalProps {
  resolve: {
    question?: PredefinedQuestion;
    checklistType: 'customer' | 'intent';
    onSave: (question: PredefinedQuestion) => void;
  };
}

const emptyQuestion: PredefinedQuestion = {
  description: '',
  user_guidance: '',
  question_type: 'text_input',
  required: false,
  order: 0,
  options: [],
};

export const QuestionFormModal: FC<QuestionFormModalProps> = ({
  resolve: { question, checklistType, onSave },
}) => {
  const isEdit = Boolean(question);
  const { closeDialog } = useModal();

  const handleSubmit = (formData: PredefinedQuestion) => {
    onSave(formData);
    closeDialog();
  };

  // Map checklistType to checklist_type format
  const mockChecklist = {
    uuid: 'mock',
    url: 'mock',
    checklist_type:
      checklistType === 'customer'
        ? ('onboarding_customer' as const)
        : ('onboarding_intent' as const),
  };

  return (
    <Form
      onSubmit={handleSubmit}
      mutators={{ ...arrayMutators }}
      initialValues={question || emptyQuestion}
      render={({ handleSubmit, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Edit question') : translate('Add question')
            }
            closeButton
            bodyClassName="h-500px mh-500px"
            footer={
              <>
                <CloseDialogButton />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!values.description || !values.question_type}
                >
                  {translate('Save')}
                </button>
              </>
            }
          >
            <Tabs
              defaultActiveKey="general"
              id="question-tabs"
              className="nav-line-tabs mb-5"
            >
              <Tab eventKey="general" title={translate('General')}>
                <QuestionGeneralForm
                  values={values}
                  checklist={mockChecklist}
                />
              </Tab>
            </Tabs>
          </ModalDialog>
        </form>
      )}
    />
  );
};
