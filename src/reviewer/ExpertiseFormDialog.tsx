import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import {
  reviewerProfilesExpertiseCreate,
  ReviewerExpertiseRequest,
  ProficiencyLevelEnum,
} from 'waldur-js-client';

import { required } from '@waldur/core/validators';
import {
  FormGroup,
  SelectField,
  StringField,
  NumberField,
  SubmitButton,
} from '@waldur/form';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

const PROFICIENCY_LEVEL_OPTIONS = [
  { value: 'expert', label: translate('Expert') },
  { value: 'familiar', label: translate('Familiar') },
  { value: 'basic', label: translate('Basic') },
];

interface ExpertiseFormDialogProps {
  resolve: {
    profile: { uuid: string };
    refetch: () => void;
  };
}

export const ExpertiseFormDialog = ({ resolve }: ExpertiseFormDialogProps) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const initialValues = {
    proficiency_level: PROFICIENCY_LEVEL_OPTIONS[0],
  };

  const onSubmit = async (formValues) => {
    try {
      const body: ReviewerExpertiseRequest = {
        expertise_keyword: formValues.expertise_keyword,
        proficiency_level: formValues.proficiency_level
          ?.value as ProficiencyLevelEnum,
        years_experience: formValues.years_experience || null,
      };

      await reviewerProfilesExpertiseCreate({
        path: { uuid: resolve.profile.uuid },
        body,
      });

      showSuccess(translate('Expertise keyword has been added.'));
      closeDialog();
      await resolve.refetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to add expertise keyword.'));
    }
  };

  return (
    <Form
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add expertise keyword')}
            subtitle={translate(
              'Add keywords describing your areas of expertise for proposal matching.',
            )}
            closeButton
            iconNode={<PlusCircleIcon weight="bold" />}
            iconColor="success"
            footer={
              <>
                <CloseDialogButton className="min-w-125px" />
                <SubmitButton
                  submitting={submitting}
                  disabled={invalid}
                  label={translate('Add')}
                  className="btn btn-primary min-w-125px"
                />
              </>
            }
          >
            <Field
              name="expertise_keyword"
              label={translate('Keyword')}
              description={translate(
                'Enter a keyword or phrase describing your expertise',
              )}
              component={FormGroup as any}
              validate={required}
            >
              <StringField />
            </Field>

            <Field
              name="proficiency_level"
              label={translate('Proficiency level')}
              component={FormGroup as any}
              options={PROFICIENCY_LEVEL_OPTIONS}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              isClearable={false}
            >
              <SelectField />
            </Field>

            <Field
              name="years_experience"
              label={translate('Years of experience')}
              component={FormGroup as any}
            >
              <NumberField min={0} max={50} />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
