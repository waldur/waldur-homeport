import { useQuery, useQueryClient } from '@tanstack/react-query';
import { isEqual } from 'es-toolkit';
import { FC, useMemo, useState } from 'react';
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
  onboardingQuestionMetadataCreate,
  onboardingQuestionMetadataDestroy,
  onboardingQuestionMetadataList,
  onboardingQuestionMetadataUpdate,
  QuestionAdmin,
  QuestionAdminRequest,
} from 'waldur-js-client';

import { getAllPages, MAX_PAGE_SIZE } from '@/core/api';
import { STALE_TIME } from '@/core/constants';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { AtLeast } from '@/core/types';
import { translate } from '@/i18n';
import { CHECKLIST_TABLE_ID } from '@/marketplace-checklist/constants';
import { shouldRemoveOnboardingMetadata } from '@/marketplace-checklist/onboardingMetadata';
import { ChecklistQuestionForm } from '@/marketplace-checklist/types';
import { RANGE_QUESTION_TYPES } from '@/marketplace-checklist/utils';
import { useModal } from '@/modal/actions';
import { useNotify } from '@/store/notify';

import { QuestionForm } from './QuestionForm';

interface QuestionFormDialogProps {
  resolve: {
    checklist: AtLeast<Checklist, 'uuid' | 'url'>;
    question?: QuestionAdmin;
  };
  initialValues?: ChecklistQuestionForm;
}

const toBound = (value) =>
  value === null || value === undefined || value === '' ? null : value;

export const QuestionFormDialog: FC<QuestionFormDialogProps> = ({
  resolve: { checklist, question },
  initialValues,
}) => {
  const { closeDialog } = useModal();
  const { showSuccess, showErrorResponse } = useNotify();
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
    staleTime: STALE_TIME,
  });

  // Load onboarding metadata (For edit mode - if checklist is onboarding type)
  const isOnboardingChecklist =
    checklist?.checklist_type === 'onboarding_customer' ||
    checklist?.checklist_type === 'onboarding_intent';

  const {
    data: onboardingMetadata,
    isLoading: isLoadingMetadata,
    error: errorMetadata,
    refetch: refetchMetadata,
  } = useQuery({
    queryKey: ['OnboardingMetadata', question?.uuid],
    queryFn: () =>
      question?.uuid && isOnboardingChecklist
        ? onboardingQuestionMetadataList({
            query: { question_uuid: question.uuid },
          }).then((response) => response.data[0] || null)
        : null,
    staleTime: STALE_TIME,
    enabled: Boolean(question?.uuid) && isOnboardingChecklist,
  });

  const initialValuesWithDeps = useMemo<ChecklistQuestionForm>(() => {
    let values = initialValues;

    // Add dependencies
    if (deps?.length) {
      values = {
        ...values,
        conditions: deps.map((dep) => ({
          uuid: dep.uuid,
          depends_on_question: dep.depends_on_question,
          operator: dep.operator,
          required_answer_value: dep.required_answer_value,
        })),
      };
    }

    // Add onboarding metadata
    if (onboardingMetadata) {
      values = {
        ...values,
        maps_to_customer_field: onboardingMetadata.maps_to_customer_field || '',
        intent_field: onboardingMetadata.intent_field || '',
      };
    }

    return values;
  }, [initialValues, deps, onboardingMetadata]);

  // Store the question if it saved, to avoid recreating it if there is an error with options, deps or conditions.
  const [savedQuestion, setSavedQuestion] = useState<QuestionAdmin>(null);
  const isEdit = Boolean(question?.uuid);

  // FIX THIS: complete the function - user guidance and trigger remained
  const onSubmit = async (formData: ChecklistQuestionForm) => {
    try {
      const body: QuestionAdminRequest = {
        checklist: checklist.url,
        description: formData.description,
        user_guidance: formData.user_guidance,
        question_type: formData.question_type,
        review_answer_value: formData.review_answer_value,
        required: formData.required || false,
        order: formData.order,
      };

      if (RANGE_QUESTION_TYPES.includes(formData.question_type)) {
        // A bound of 0 is a bound; only an empty field means none.
        body.min_value = toBound(formData.min_value);
        body.max_value = toBound(formData.max_value);
      }

      if (formData.question_type === 'likert') {
        body.likert_scale_length = formData.likert_scale_length ?? 5;
        body.likert_low_label = formData.likert_low_label || '';
        body.likert_high_label = formData.likert_high_label || '';
        body.likert_allow_na = Boolean(formData.likert_allow_na);
      }

      if (formData.question_type === 'rich_text') {
        body.rich_text_char_limit = formData.rich_text_char_limit
          ? Number(formData.rich_text_char_limit)
          : null;
        body.rich_text_toolbar_level =
          formData.rich_text_toolbar_level ?? 'standard';
      }

      if (['file', 'multiple_files'].includes(formData.question_type)) {
        body.allowed_file_types = formData.allowed_file_types ?? [];
        body.allowed_mime_types = formData.allowed_mime_types ?? [];
        body.max_file_size_mb = formData.max_file_size_mb
          ? Number(formData.max_file_size_mb)
          : null;
        // max_files_count is only valid for multiple_files (backend rejects it for file).
        body.max_files_count =
          formData.question_type === 'multiple_files' &&
          formData.max_files_count
            ? Number(formData.max_files_count)
            : null;
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

      // Save onboarding metadata (for onboarding checklists only)
      if (isOnboardingChecklist) {
        const hasCustomerField = Boolean(
          formData.maps_to_customer_field?.trim(),
        );
        const hasIntentField = Boolean(formData.intent_field?.trim());

        if (hasCustomerField || hasIntentField) {
          // Create or update metadata
          if (onboardingMetadata?.uuid) {
            // Update existing
            await onboardingQuestionMetadataUpdate({
              path: { uuid: onboardingMetadata.uuid },
              body: {
                question: saved.url,
                maps_to_customer_field:
                  formData.maps_to_customer_field?.trim() || '',
                intent_field: formData.intent_field?.trim() || '',
              },
            });
          } else {
            // Create new
            await onboardingQuestionMetadataCreate({
              // Create only; both columns default to blank on the server.
              body: {
                question: saved.url,
                // eslint-disable-next-line waldur-custom/no-undefined-in-mutation-body -- create-only, server default is ''
                maps_to_customer_field:
                  formData.maps_to_customer_field?.trim() || undefined,
                // eslint-disable-next-line waldur-custom/no-undefined-in-mutation-body -- create-only, server default is ''
                intent_field: formData.intent_field?.trim() || undefined,
              },
            });
          }

          // Invalidate metadata query
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: ['OnboardingMetadata', saved.uuid],
            });
          }, 1000);
        } else if (
          shouldRemoveOnboardingMetadata(formData, onboardingMetadata?.uuid)
        ) {
          await onboardingQuestionMetadataDestroy({
            path: { uuid: onboardingMetadata.uuid },
          });
          // Drop the deleted row from the cache at once: reopening the
          // question before a delayed refetch would edit a row that is gone.
          queryClient.setQueryData(['OnboardingMetadata', saved.uuid], null);
        }
      }

      if (!isEdit) {
        // Invalidate the checklists table query cache
        queryClient.invalidateQueries({
          queryKey: ['table', CHECKLIST_TABLE_ID],
        });
      }

      // Invalidate checklist questions query (after 1 sec to prevent immediate refetch)
      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['ChecklistQuestions', checklist.uuid],
        });
      }, 1000);

      // Refetch the questions table
      queryClient.invalidateQueries({
        queryKey: ['table', 'ChecklistQuestions-' + checklist.uuid],
      });

      showSuccess(
        isEdit
          ? translate('Question has been updated.')
          : translate('Question has been added.'),
      );
      // Only a retry after a partial failure reuses it; "Create another"
      // must create a new question.
      setSavedQuestion(null);
      return true;
    } catch (e) {
      showErrorResponse(
        e,
        isEdit
          ? translate('Unable to update question.')
          : translate('Unable to add question.'),
      );
      return false;
    }
  };

  if (isLoadingDeps || isLoadingMetadata) {
    return <LoadingSpinner />;
  } else if (errorDeps) {
    return <LoadingErred loadData={refetchDeps} />;
  } else if (errorMetadata) {
    return <LoadingErred loadData={refetchMetadata} />;
  }

  return (
    <QuestionForm
      title={isEdit ? translate('Edit question') : translate('Add question')}
      initialValues={initialValuesWithDeps}
      isEdit={isEdit}
      onSubmit={onSubmit}
      onDone={closeDialog}
      checklist={checklist}
      question={question || savedQuestion}
    />
  );
};
