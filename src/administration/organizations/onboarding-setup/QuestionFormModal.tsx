import arrayMutators from 'final-form-arrays';
import { FC, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  Checklist,
  checklistsAdminQuestionOptionsCreate,
  checklistsAdminQuestionsCreate,
  checklistsAdminQuestionsUpdate,
  onboardingQuestionMetadataCreate,
  onboardingQuestionMetadataUpdate,
} from 'waldur-js-client';

import { translate } from '@waldur/i18n';
import { QuestionGeneralForm } from '@waldur/marketplace-checklist/checklists/questions/QuestionGeneralForm';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

import { PredefinedQuestion } from './predefinedQuestions';

interface QuestionFormModalProps {
  resolve: {
    question?: PredefinedQuestion;
    checklistType: 'customer' | 'intent';
    checklist?: Checklist;
    onSave: () => Promise<void>;
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
  resolve: { question, checklistType, checklist, onSave },
}) => {
  const isEdit = Boolean(question);
  const { closeDialog } = useModal();
  const dispatch = useDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (formData: PredefinedQuestion) => {
    setIsSubmitting(true);

    try {
      const questionData: any = {
        checklist: checklist.url,
        description: formData.description,
        user_guidance: formData.user_guidance || '',
        question_type: formData.question_type,
        required: formData.required,
        order: formData.order,
      };

      if (formData.min_value !== undefined) {
        questionData.min_value = String(formData.min_value);
      }
      if (formData.max_value !== undefined) {
        questionData.max_value = String(formData.max_value);
      }

      let savedQuestion;

      if (isEdit && question?.uuid) {
        // Update existing question
        savedQuestion = await checklistsAdminQuestionsUpdate({
          path: { uuid: question.uuid },
          body: questionData,
        }).then((res) => res.data);
      } else {
        // Create new question
        savedQuestion = await checklistsAdminQuestionsCreate({
          body: questionData,
        }).then((res) => res.data);
      }

      // Handle options for select questions (only for new questions for now)
      if (
        !isEdit &&
        ['single_select', 'multi_select'].includes(formData.question_type) &&
        formData.options?.length
      ) {
        for (let i = 0; i < formData.options.length; i++) {
          await checklistsAdminQuestionOptionsCreate({
            body: {
              question: savedQuestion.url,
              label: formData.options[i],
              order: i,
            },
          });
        }
      }

      // Create or update metadata
      if (formData.maps_to_customer_field || formData.intent_field) {
        if (isEdit && question?.metadata_uuid) {
          // Update existing metadata
          await onboardingQuestionMetadataUpdate({
            path: { uuid: question.metadata_uuid },
            body: {
              question: savedQuestion.url,
              maps_to_customer_field: formData.maps_to_customer_field || '',
              intent_field: formData.intent_field || '',
            },
          });
        } else {
          // Create new metadata
          await onboardingQuestionMetadataCreate({
            body: {
              question: savedQuestion.url,
              maps_to_customer_field: formData.maps_to_customer_field || '',
              intent_field: formData.intent_field || '',
            },
          });
        }
      }

      dispatch(
        showSuccess(
          isEdit
            ? translate('Question has been updated.')
            : translate('Question has been created.'),
        ),
      );

      await onSave();
      closeDialog();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          isEdit
            ? translate('Failed to update question.')
            : translate('Failed to create question.'),
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Map checklistType to checklist_type format
  const mockChecklist = {
    uuid: checklist?.uuid || 'mock',
    url: checklist?.url || 'mock',
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
                  disabled={
                    !values.description || !values.question_type || isSubmitting
                  }
                >
                  {isSubmitting ? translate('Saving...') : translate('Save')}
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
