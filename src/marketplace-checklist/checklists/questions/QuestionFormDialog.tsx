import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FormApi } from 'final-form';
import arrayMutators from 'final-form-arrays';
import { isEqual } from 'lodash-es';
import { FC, useMemo, useState } from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import {
  Checklist,
  checklistsAdminQuestionDependenciesCreate,
  checklistsAdminQuestionDependenciesDestroy,
  checklistsAdminQuestionDependenciesList,
  checklistsAdminQuestionDependenciesPartialUpdate,
  checklistsAdminQuestionOptionsCreate,
  checklistsAdminQuestionOptionsDestroy,
  checklistsAdminQuestionOptionsPartialUpdate,
  checklistsAdminQuestionsCreate,
  checklistsAdminQuestionsUpdate,
  QuestionAdmin,
  QuestionAdminRequest,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@waldur/core/api';
import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
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
  const queryClient = useQueryClient();

  // Load question dependencies (For edit mode - visibility tab)
  const {
    data: deps,
    isLoading: isLoadingDeps,
    error: errorDeps,
    refetch: refetchDeps,
  } = useQuery({
    queryKey: ['QuestionDeps', question?.uuid],
    queryFn: () =>
      question?.uuid
        ? getAllPages((page) =>
            checklistsAdminQuestionDependenciesList({
              query: {
                question_uuid: question.uuid,
                page,
                page_size: MAX_PAGE_SIZE,
              },
            }),
          )
        : null,
    staleTime: 5 * 60 * 1000,
  });

  const initialValuesWithDeps = useMemo<ChecklistQuestionForm>(() => {
    if (!deps?.length) return initialValues;
    return {
      ...initialValues,
      conditions: deps.map((dep) => ({
        uuid: dep.uuid,
        depends_on_question: dep.depends_on_question,
        operator: dep.operator,
        required_answer_value: dep.required_answer_value,
      })),
    };
  }, [initialValues, deps]);

  // Store the question if it saved, to avoid recreating it if there is an error with options, deps or conditions.
  const [savedQuestion, setSavedQuestion] = useState<QuestionAdmin>(null);
  const [createAnother, setCreateAnother] = useState(false);
  const isEdit = Boolean(question?.uuid);

  // FIX THIS: complete the function - user guidance and trigger remained
  const onSubmit = async (formData: ChecklistQuestionForm, form: FormApi) => {
    try {
      const body: QuestionAdminRequest = {
        checklist: checklist.url,
        description: formData.description,
        question_type: formData.question_type,
        review_answer_value: formData.review_answer_value,
        required: formData.required || false,
        order: formData.order,
      };

      if (formData.question_type === 'number') {
        body.min_value = formData.min_value || null;
        body.max_value = formData.max_value || null;
      }

      if (formData.conditions?.length) {
        body.dependency_logic_operator = formData.dependency_logic_operator;
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
      const prevConditions = initialValuesWithDeps?.conditions || [];
      const conditions = formData.conditions || [];
      if (conditions.length || prevConditions.length) {
        const newConditions = conditions.filter(
          (cond) =>
            !prevConditions.some(
              (p) => p.depends_on_question === cond.depends_on_question,
            ),
        );
        const updatedConditions = [];
        conditions.forEach((cond) => {
          const prevCond = prevConditions.find(
            (p) => p.depends_on_question === cond.depends_on_question,
          );
          if (
            prevCond &&
            (prevCond.operator !== cond.operator ||
              !isEqual(
                prevCond.required_answer_value,
                cond.required_answer_value,
              ))
          ) {
            updatedConditions.push({ ...cond, uuid: prevCond.uuid });
          }
        });
        const removedConditions = prevConditions.filter(
          (p) =>
            !conditions.some(
              (cond) => cond.depends_on_question === p.depends_on_question,
            ),
        );

        const dependenciesPromises = [];
        // Create new conditions
        for (const cond of newConditions) {
          dependenciesPromises.push(
            checklistsAdminQuestionDependenciesCreate({
              body: { question: saved.url, ...cond },
            }),
          );
        }
        // Update existing condition
        for (const cond of updatedConditions) {
          dependenciesPromises.push(
            checklistsAdminQuestionDependenciesPartialUpdate({
              path: { uuid: cond.uuid },
              body: cond,
            }),
          );
        }
        // Remove deleted condition
        for (const cond of removedConditions) {
          dependenciesPromises.push(
            checklistsAdminQuestionDependenciesDestroy({
              path: { uuid: cond.uuid },
            }),
          );
        }

        await Promise.all(dependenciesPromises);
        if (dependenciesPromises.length) {
          // Invalidate question dependencies query (after 1 sec to prevent immediate refetch)
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: ['QuestionDeps', question?.uuid],
            });
          }, 1000);
        }
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

      // Invalidate checklist questions query (after 1 sec to prevent immediate refetch)
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['ChecklistQuestions', checklist.uuid],
        });
      }, 1000);

      // Refetch the questions table
      dispatch(fetchListStart('ChecklistQuestions-' + checklist.uuid));

      showSuccess(
        isEdit
          ? translate('Question has been updated.')
          : translate('Question has been added.'),
      );
      if (createAnother) {
        form.restart();
        setCreateAnother(false);
        setSavedQuestion(null);
      } else {
        closeDialog();
      }
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to update question.')
          : translate('Unable to add question.'),
      );
    }
  };

  if (isLoadingDeps) {
    return <LoadingSpinner />;
  } else if (errorDeps) {
    return <LoadingErred loadData={refetchDeps} />;
  }

  return (
    <Form
      onSubmit={onSubmit}
      mutators={{ ...arrayMutators }}
      initialValues={initialValuesWithDeps}
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
                {!isEdit && (
                  <AwesomeCheckbox
                    type="checkbox"
                    label={translate('Create another')}
                    disabled={submitting}
                    value={createAnother}
                    onChange={setCreateAnother}
                    className="me-auto"
                    id="check-another"
                  />
                )}
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
              className="nav-line-tabs mb-5"
              mountOnEnter
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
                  <QuestionVisibilityForm
                    checklistUuid={checklist.uuid}
                    question={question || savedQuestion}
                  />
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
