import { useQuery } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import { Row } from 'react-bootstrap';
import { Form } from 'react-final-form';
import {
  checklistsAdminList,
  feedbackRequestsCount,
  FeedbackSurvey,
  FeedbackSurveyRequest,
  feedbackSurveysCreate,
  feedbackSurveysUpdate,
} from 'waldur-js-client';

import { AudienceFields } from '@/broadcasts/AudienceFields';
import { fetchResultCount } from '@/core/api';
import { composeValidators, greaterThan, required } from '@/core/validators';
import {
  AsyncSelectGroup,
  BooleanGroup,
  DateTimeGroup,
  MarkdownGroup,
  NumberGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface FeedbackSurveyFormDialogProps {
  resolve: { survey?: FeedbackSurvey; refetch };
}

const positive = composeValidators(required, greaterThan(0));

const validateAudience = (values) =>
  values.all_users || values.customers?.length || values.offerings?.length
    ? {}
    : {
        customers: translate('Choose all users, organizations or offerings.'),
      };

// The audience error sits on a field that shows it only once touched, so the
// button names it too.
const getDisabledReason = (errors: Record<string, string>) =>
  [
    Object.keys(errors).some((name) => name !== 'customers') &&
      translate('Fill in the required fields.'),
    errors.customers,
  ]
    .filter(Boolean)
    .join(' ');

const serializeSurvey = ({
  checklist,
  all_users,
  customers,
  offerings,
  ...rest
}: Record<string, any>): FeedbackSurveyRequest => ({
  ...(rest as Omit<FeedbackSurveyRequest, 'checklist'>),
  // Sent explicitly: a cleared field left out of the PUT would keep its old value.
  intro: rest.intro ?? '',
  checklist: checklist?.uuid,
  audience_query: {
    all_users: Boolean(all_users),
    customers: customers?.map((item) => item.uuid) ?? [],
    offerings: offerings?.map((item) => item.uuid) ?? [],
  },
});

export const FeedbackSurveyFormDialog: FC<FeedbackSurveyFormDialogProps> = ({
  resolve,
}) => {
  const survey = resolve.survey;
  const isEdit = Boolean(survey?.uuid);

  const initialValues = useMemo(
    () =>
      survey
        ? {
            name: survey.name,
            intro: survey.intro,
            checklist: { uuid: survey.checklist, name: survey.checklist_name },
            starts_at: survey.starts_at,
            ends_at: survey.ends_at,
            is_active: survey.is_active,
            max_prompts: survey.max_prompts,
            snooze_days: survey.snooze_days,
            all_users: survey.audience?.all_users,
            customers: survey.audience?.customers,
            offerings: survey.audience?.offerings,
          }
        : { is_active: true, max_prompts: 3, snooze_days: 3 },
    [survey],
  );

  // The backend refuses a new questionnaire once anyone has been prompted.
  const { data: promptedCount } = useQuery({
    queryKey: ['FeedbackSurveyPromptedCount', survey?.uuid],
    queryFn: () =>
      feedbackRequestsCount({ query: { survey_uuid: survey.uuid } }).then(
        fetchResultCount,
      ),
    enabled: isEdit,
  });
  const checklistLocked = promptedCount > 0;

  const loadChecklists = useMemo(
    () =>
      createLoadOptions(checklistsAdminList, 'none', {
        checklist_type: 'feedback',
      }),
    [],
  );

  const onSubmitMutation = useManagedMutation<any, any, any>({
    mutationFn: (values) =>
      isEdit
        ? feedbackSurveysUpdate({
            path: { uuid: survey.uuid },
            body: serializeSurvey(values),
          })
        : feedbackSurveysCreate({ body: serializeSurvey(values) }),
    successMessage: isEdit
      ? translate('Survey has been updated.')
      : translate('Survey has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update survey.')
      : translate('Unable to create survey.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) => onSubmitMutation.mutateAsync(values)}
      validate={validateAudience}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, errors }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={
              isEdit ? translate('Edit survey') : translate('Create survey')
            }
            footer={
              <SubmitButton
                disabled={invalid}
                disabledReason={invalid ? getDisabledReason(errors) : undefined}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
              required
              validate={required}
            />
            <MarkdownGroup
              name="intro"
              label={translate('Intro')}
              description={translate(
                'Shown above the questions. Tell respondents that staff will see who answered.',
              )}
            />
            <AsyncSelectGroup
              name="checklist"
              label={translate('Questionnaire')}
              description={
                checklistLocked
                  ? translate(
                      "Users have been prompted, so the questionnaire can't be changed.",
                    )
                  : translate('A checklist of the feedback survey type.')
              }
              isDisabled={checklistLocked}
              loadOptions={loadChecklists}
              getOptionLabel={(option) => option.name}
              getOptionValue={(option) => option.uuid}
              required
              validate={required}
            />
            <Row>
              <DateTimeGroup
                name="starts_at"
                label={translate('Starts at')}
                required
                validate={required}
                className="col-md-6"
              />
              <DateTimeGroup
                name="ends_at"
                label={translate('Ends at')}
                required
                validate={required}
                className="col-md-6"
              />
            </Row>
            <AudienceFields
              allUsersLabel={translate('Ask all users')}
              hint={translate(
                'With both organizations and offerings selected, only users of those offerings in those organizations are asked.',
              )}
            />
            <Row>
              <NumberGroup
                name="max_prompts"
                required
                validate={positive}
                label={translate('Max prompts')}
                description={translate(
                  'How many times a user is prompted at most.',
                )}
                min={1}
                className="col-md-6"
              />
              <NumberGroup
                name="snooze_days"
                required
                validate={positive}
                label={translate('Snooze days')}
                description={translate(
                  'Days the prompt stays hidden after it is shown or postponed.',
                )}
                min={1}
                className="col-md-6"
              />
            </Row>
            <BooleanGroup
              name="is_active"
              label={translate('Active')}
              hideLabel
              spaceless
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
