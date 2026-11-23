import { useQuery } from '@tanstack/react-query';
import arrayMutators from 'final-form-arrays';
import { FC, useMemo } from 'react';
import {
  feedbackRequestsCount,
  FeedbackSurvey,
  FeedbackSurveyDetailRequest,
  feedbackSurveysCreate,
  feedbackSurveysRetrieve,
  feedbackSurveysUpdate,
} from 'waldur-js-client';

import type { ProgressStep } from 'waldur-ui';
import { Wizard } from 'waldur-wizard';

import { fetchResultCount } from '@/core/api';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

import { AudienceScheduleStep } from './AudienceScheduleStep';
import { DetailsStep } from './DetailsStep';
import { fromSurveyQuestion, toSurveyQuestionRequest } from './localQuestions';
import { QuestionsStep } from './QuestionsStep';
import { ReviewStep } from './ReviewStep';
import { SurveyWizardValues } from './types';

interface FeedbackSurveyWizardProps {
  resolve: { survey?: FeedbackSurvey; refetch };
}

const steps: ProgressStep[] = [
  { key: 'details', label: translate('Details'), completed: false },
  { key: 'questions', label: translate('Questions'), completed: false },
  {
    key: 'audience',
    label: translate('Audience & schedule'),
    completed: false,
  },
  { key: 'review', label: translate('Review'), completed: false },
];

const wizardForms = [
  DetailsStep,
  QuestionsStep,
  AudienceScheduleStep,
  ReviewStep,
];

const mutators = { ...arrayMutators };

const createValues: Partial<SurveyWizardValues> = {
  questions: [],
  is_active: true,
  max_prompts: 3,
  snooze_days: 3,
};

// Read once per opening: a refetch while the wizard is open would reset the
// form to the new initial values and drop the user's edits.
const readOnce = { staleTime: Infinity, gcTime: 0 };

// Fields are picked one by one so that form-only fields (the copy picker's
// selection) never reach the API.
export const serializeSurvey = (
  values: SurveyWizardValues,
  locked: boolean,
): FeedbackSurveyDetailRequest => ({
  name: values.name,
  // Sent explicitly: a cleared field left out of the PUT would keep its old value.
  intro: values.intro ?? '',
  starts_at: values.starts_at,
  ends_at: values.ends_at,
  is_active: values.is_active,
  max_prompts: values.max_prompts,
  snooze_days: values.snooze_days,
  audience_query: {
    all_users: Boolean(values.all_users),
    customers: values.customers?.map((item) => item.uuid) ?? [],
    offerings: values.offerings?.map((item) => item.uuid) ?? [],
  },
  // A prompted survey refuses any questions value, even an unchanged one.
  ...(locked
    ? {}
    : { questions: (values.questions ?? []).map(toSurveyQuestionRequest) }),
});

export const FeedbackSurveyWizard: FC<FeedbackSurveyWizardProps> = ({
  resolve,
}) => {
  const survey = resolve.survey;
  const isEdit = Boolean(survey?.uuid);
  const title = isEdit ? translate('Edit survey') : translate('Create survey');

  const detailQuery = useQuery({
    queryKey: ['FeedbackSurveyDetail', survey?.uuid],
    queryFn: () =>
      feedbackSurveysRetrieve({ path: { uuid: survey.uuid } }).then(
        (response) => response.data,
      ),
    enabled: isEdit,
    ...readOnce,
  });

  // The backend refuses a new questionnaire once anyone has been prompted.
  const countQuery = useQuery({
    queryKey: ['FeedbackSurveyPromptedCount', survey?.uuid],
    queryFn: () =>
      feedbackRequestsCount({ query: { survey_uuid: survey.uuid } }).then(
        fetchResultCount,
      ),
    enabled: isEdit,
    ...readOnce,
  });
  const locked = countQuery.data > 0;

  const detail = detailQuery.data;
  const initialValues = useMemo<Partial<SurveyWizardValues>>(
    () =>
      detail
        ? {
            name: detail.name,
            intro: detail.intro,
            questions: (detail.questions ?? []).map(fromSurveyQuestion),
            starts_at: detail.starts_at,
            ends_at: detail.ends_at,
            is_active: detail.is_active,
            max_prompts: detail.max_prompts,
            snooze_days: detail.snooze_days,
            all_users: detail.audience?.all_users,
            customers: detail.audience?.customers,
            offerings: detail.audience?.offerings,
          }
        : createValues,
    [detail],
  );
  const data = useMemo(
    () => ({ locked, surveyUuid: survey?.uuid }),
    [locked, survey?.uuid],
  );

  const onSubmitMutation = useManagedMutation<any, any, SurveyWizardValues>({
    mutationFn: (values) =>
      isEdit
        ? feedbackSurveysUpdate({
            path: { uuid: survey.uuid },
            body: serializeSurvey(values, locked),
          })
        : feedbackSurveysCreate({ body: serializeSurvey(values, locked) }),
    successMessage: isEdit
      ? translate('Survey has been updated.')
      : translate('Survey has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update survey.')
      : translate('Unable to create survey.'),
    refetch: resolve.refetch,
  });

  if (isEdit && (detailQuery.isError || countQuery.isError)) {
    return (
      <ModalDialog title={title}>
        <LoadingErred
          loadData={() => {
            detailQuery.refetch();
            countQuery.refetch();
          }}
        />
      </ModalDialog>
    );
  }

  if (isEdit && (detailQuery.isPending || countQuery.isPending)) {
    return (
      <ModalDialog title={title}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  return (
    <Wizard<SurveyWizardValues>
      title={title}
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={(values) =>
        onSubmitMutation.mutateAsync(values).catch((error) => {
          // useManagedMutation shows the error. A survey that someone was
          // prompted for while the wizard was open refuses its questions:
          // reread the count so the wizard locks and the next save leaves
          // them out, instead of failing on every try.
          if (isEdit && error?.response?.data?.questions) {
            countQuery.refetch();
          }
        })
      }
      initialValues={initialValues}
      mutators={mutators}
      data={data}
      submitLabel={isEdit ? translate('Save') : translate('Create')}
    />
  );
};
