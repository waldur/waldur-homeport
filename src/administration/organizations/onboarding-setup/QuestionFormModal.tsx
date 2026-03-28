import arrayMutators from 'final-form-arrays';
import { FC, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  Checklist,
  checklistsAdminQuestionOptionsCreate,
  checklistsAdminQuestionOptionsDestroy,
  checklistsAdminQuestionOptionsPartialUpdate,
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

      const isSelectType = ['single_select', 'multi_select'].includes(
        formData.question_type,
      );

      if (isSelectType) {
        const nextOptions = (formData.options || []).map((label, order) => ({
          label,
          order,
        }));
        const previousOptions = [...(question?.question_options || [])].sort(
          (a, b) => a.order - b.order,
        );

        const optionsCount = previousOptions.length;
        const optionsToCreate = nextOptions.slice(optionsCount);
        const optionsToUpdate = nextOptions.filter((opt, index) => {
          const previous = previousOptions[index];
          if (!previous) {
            return false;
          }
          return previous.label !== opt.label || previous.order !== opt.order;
        });
        const optionsToDelete = previousOptions.slice(nextOptions.length);

        const optionRequests = [];

        for (const opt of optionsToCreate) {
          optionRequests.push(
            checklistsAdminQuestionOptionsCreate({
              body: {
                question: savedQuestion.url,
                label: opt.label,
                order: opt.order,
              },
            }),
          );
        }

        for (const opt of optionsToUpdate) {
          const previous = previousOptions.find(
            (item) => item.order === opt.order,
          );
          if (!previous) {
            continue;
          }
          optionRequests.push(
            checklistsAdminQuestionOptionsPartialUpdate({
              path: { uuid: previous.uuid },
              body: {
                label: opt.label,
                order: opt.order,
              },
            }),
          );
        }

        for (const opt of optionsToDelete) {
          optionRequests.push(
            checklistsAdminQuestionOptionsDestroy({
              path: { uuid: opt.uuid },
            }),
          );
        }

        await Promise.all(optionRequests);
      } else if (question?.question_options?.length) {
        // If question type changed from select to another type, remove stale options.
        await Promise.all(
          question.question_options.map((opt) =>
            checklistsAdminQuestionOptionsDestroy({ path: { uuid: opt.uuid } }),
          ),
        );
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
