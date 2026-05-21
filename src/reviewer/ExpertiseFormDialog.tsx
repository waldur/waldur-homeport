import { PlusCircleIcon } from '@phosphor-icons/react';
import { Field, Form } from 'react-final-form';
import {
  ProficiencyLevelEnum,
  nestedReviewerProfileExpertiseCreate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  FormGroup,
  NumberField,
  SelectField,
  StringField,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

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
  const initialValues = {
    proficiency_level: PROFICIENCY_LEVEL_OPTIONS[0],
  };

  const addExpertiseMutation = useManagedMutation<any, any, any>({
    mutationFn: (formValues) =>
      nestedReviewerProfileExpertiseCreate({
        path: { reviewer_profile_uuid: resolve.profile.uuid },
        body: {
          expertise_keyword: formValues.expertise_keyword,
          proficiency_level: formValues.proficiency_level
            ?.value as ProficiencyLevelEnum,
          years_experience: formValues.years_experience || null,
        },
      }),
    successMessage: translate('Expertise keyword has been added.'),
    errorMessage: translate('Unable to add expertise keyword.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      initialValues={initialValues}
      onSubmit={(values) => addExpertiseMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add expertise keyword')}
            subtitle={translate(
              'Add keywords describing your areas of expertise for proposal matching.',
            )}
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
              component={FormGroup}
              validate={required}
            >
              <StringField />
            </Field>

            <Field
              name="proficiency_level"
              label={translate('Proficiency level')}
              component={FormGroup}
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
              component={FormGroup}
            >
              <NumberField min={0} max={50} />
            </Field>
          </ModalDialog>
        </form>
      )}
    />
  );
};
