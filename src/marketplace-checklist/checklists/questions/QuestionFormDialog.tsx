import arrayMutators from 'final-form-arrays';
import { FC, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  Checklist,
  checklistsAdminQuestionDependenciesCreate,
  checklistsAdminQuestionOptionsCreate,
  checklistsAdminQuestionOptionsDestroy,
  checklistsAdminQuestionOptionsPartialUpdate,
  checklistsAdminQuestionsCreate,
  checklistsAdminQuestionsUpdate,
  QuestionAdmin,
  QuestionAdminRequest,
} from 'waldur-js-client';

import { AtLeast } from '@waldur/core/types';
import { SubmitButton } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CHECKLIST_TABLE_ID } from '@waldur/marketplace-checklist/constants';
import { ChecklistQuestionForm } from '@waldur/marketplace-checklist/types';
import { CHECKLIST_FLAGS } from '@waldur/marketplace-checklist/utils';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';
import { fetchListStart, updateEntity } from '@waldur/table/actions';

import { QuestionGeneralForm } from './QuestionGeneralForm';
import { QuestionGuidanceForm } from './QuestionGuidanceForm';
import { QuestionReviewTriggersForm } from './QuestionReviewTriggersForm';
import { QuestionVisibilityForm } from './QuestionVisibilityForm';

interface QuestionFormDialogProps {
  resolve: {
    checklist: AtLeast<Checklist, 'uuid' | 'url'>;
    question?: QuestionAdmin;
  };
  initialValues?: ChecklistQuestionForm;
}

export const QuestionFormDialog: FC<QuestionFormDialogProps> = ({
  resolve: { checklist, question },
  initialValues,
}) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
  const dispatch = useDispatch();

  // Store the question if it saved, to avoid recreating it if there is an error with options, deps or conditions.
  const [savedQuestion, setSavedQuestion] = useState<QuestionAdmin>(null);
  const isEdit = Boolean(question?.uuid);

  // FIX THIS: complete the function - user guidance and visibility remained
  const onSubmit = async (formData: ChecklistQuestionForm) => {
    try {
      const body: QuestionAdminRequest = {
        checklist: checklist.url,
        description: formData.description,
        question_type: formData.question_type,
        review_answer_value: formData.review_answer_value,
      };

      if (formData.question_type === 'number') {
        if (formData.min_value) body.min_value = formData.min_value;
        if (formData.max_value) body.max_value = formData.max_value;
      }

      // Save question
      let saved: QuestionAdmin = savedQuestion ? { ...savedQuestion } : null;
      if (isEdit) {
        saved = await checklistsAdminQuestionsUpdate({
          path: { uuid: question.uuid },
          body,
        }).then((response) => response.data);
      } else if (!savedQuestion) {
        saved = await checklistsAdminQuestionsCreate({
          body,
        }).then((response) => response.data);
      }

      setSavedQuestion(saved);

      const isSelectType = ['single_select', 'multi_select'].includes(
        formData.question_type,
      );

      // Save options (for single-select and multi-select)
      if (isSelectType && formData.options) {
        const prevOptions =
          (savedQuestion
            ? savedQuestion.question_options
            : question?.question_options) || [];
        prevOptions.sort((a, b) => (a.order > b.order ? 1 : -1));
        const optionsCount = prevOptions.length;
        // Options with order
        const options = formData.options.map((opt, idx) => ({
          order: idx,
          label: opt,
        }));
        const newOptions = options.slice(optionsCount);
        const updatedOptions = options.filter((opt, index) =>
          prevOptions.some(
            (prev) => prev.order === index && prev.label !== opt.label,
          ),
        );
        const removedOptions = prevOptions.slice(options.length);

        const optionsPromises = [];
        // Create new options
        for (const opt of newOptions) {
          optionsPromises.push(
            checklistsAdminQuestionOptionsCreate({
              body: {
                question: saved.url,
                label: opt.label,
                order: opt.order,
              },
            }),
          );
        }
        // Update existing options
        for (const opt of updatedOptions) {
          optionsPromises.push(
            checklistsAdminQuestionOptionsPartialUpdate({
              path: {
                uuid: prevOptions.find((prev) => prev.order === opt.order).uuid,
              },
              body: opt,
            }),
          );
        }
        // Remove deleted options
        for (const opt of removedOptions) {
          optionsPromises.push(
            checklistsAdminQuestionOptionsDestroy({
              path: { uuid: opt.uuid },
            }),
          );
        }

        await Promise.all(optionsPromises);
      }

      // Save visibility options (dependencies)
      if (formData.conditions?.length) {
        // const prevCondition = initialValues?.conditions || [];
        const newConditions = formData.conditions;
        // const updatedCondition = formData.conditions.filter(
        //   (g) => g.uuid && prevCondition.some((p) => p.uuid === g.uuid),
        // );
        // const removedCondition = prevCondition.filter(
        //   (p) => !formData.conditions.some((g) => g.uuid === p.uuid),
        // );

        const dependenciesPromises = [];
        // Create new conditions
        for (const g of newConditions) {
          dependenciesPromises.push(
            checklistsAdminQuestionDependenciesCreate({
              body: { question: saved.url, ...g },
            }),
          );
        }
        // // Update existing condition
        // for (const g of updatedCondition) {
        //   dependenciesPromises.push(
        //     checklistsAdminQuestionDependenciesPartialUpdate({
        //       path: { uuid: g.uuid },
        //       body: g,
        //     }),
        //   );
        // }
        // // Remove deleted condition
        // for (const g of removedCondition) {
        //   dependenciesPromises.push(
        //     checklistsAdminQuestionDependenciesDestroy({
        //       path: { uuid: g.uuid },
        //     }),
        //   );
        // }

        await Promise.all(dependenciesPromises);
      }

      if (!isEdit) {
        // Update questions_count on the checklists table when creation
        dispatch(
          updateEntity(CHECKLIST_TABLE_ID, checklist.uuid, (entity) => ({
            ...entity,
            questions_count: entity.questions_count + 1,
          })),
        );
      }

      // Refetch the questions table
      dispatch(fetchListStart('ChecklistQuestions-' + checklist.uuid));

      showSuccess(
        isEdit
          ? translate('Question has been updated.')
          : translate('Question has been added.'),
      );
      closeDialog();
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to update question.')
          : translate('Unable to add question.'),
      );
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
      mutators={{ ...arrayMutators }}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, pristine, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Edit question') : translate('Add question')
            }
            closeButton
            bodyClassName="h-500px mh-500px"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  disabled={invalid || pristine}
                  submitting={submitting}
                  label={
                    isEdit ? translate('Save changes') : translate('Confirm')
                  }
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <Tabs
              defaultActiveKey="general"
              id="questions-tabs"
              className="nav-line-tabs mb-7"
            >
              <Tab eventKey="general" title={translate('General')}>
                <QuestionGeneralForm values={values} />
              </Tab>
              {CHECKLIST_FLAGS.questionFormUserGuidance && (
                <Tab
                  eventKey="user-guidance"
                  title={translate('User guidance')}
                >
                  <QuestionGuidanceForm values={values} />
                </Tab>
              )}
              {CHECKLIST_FLAGS.questionFormVisibility && (
                <Tab eventKey="visibility" title={translate('Visibility')}>
                  <QuestionVisibilityForm checklistUuid={checklist.uuid} />
                </Tab>
              )}
              {CHECKLIST_FLAGS.questionFormTriggers && (
                <Tab eventKey="triggers" title={translate('Triggers')}>
                  <QuestionReviewTriggersForm />
                </Tab>
              )}
            </Tabs>
          </ModalDialog>
        </form>
      )}
    />
  );
};
