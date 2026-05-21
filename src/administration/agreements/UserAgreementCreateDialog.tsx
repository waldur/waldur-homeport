import { useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { AgreementTypeEnum, userAgreementsCreate } from 'waldur-js-client';

import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { SelectField, SubmitButton } from '@/form';
import MarkdownEditor from '@/form/MarkdownEditor';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';

interface UserAgreementCreateDialogFormValues {
  agreement_type: { value: AgreementTypeEnum };
  content: string;
  language?: { value: string };
}

export const UserAgreementCreateDialog = ({ resolve }) => {
  const languageOptions = useMemo(
    () => [
      { label: translate('Default'), value: '' },
      ...ENV.languageChoices.map((lang) => ({
        label: lang.label,
        value: lang.code,
      })),
    ],
    [],
  );

  const { mutateAsync } = useManagedMutation<
    any,
    any,
    UserAgreementCreateDialogFormValues
  >({
    mutationFn: (formValues) =>
      userAgreementsCreate({
        body: {
          agreement_type: formValues.agreement_type.value,
          content: formValues.content,
          language: formValues.language?.value ?? '',
        },
      }),
    successMessage: translate('User agreement has been created'),
    errorMessage: translate('Unable to create a user agreement.'),
    refetch: resolve?.refetch,
  });

  return (
    <Form<UserAgreementCreateDialogFormValues>
      onSubmit={(values) => mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Create a user agreements')}
            footer={
              <SubmitButton
                submitting={submitting}
                invalid={invalid}
                label={translate('Save')}
              />
            }
          >
            <FormGroup label={translate('Agreement type')} required>
              <Field
                name="agreement_type"
                component={SelectField}
                options={[
                  { label: translate('Privacy policy'), value: 'PP' },
                  { label: translate('Terms of service'), value: 'TOS' },
                ]}
                validate={required}
              />
            </FormGroup>
            <FormGroup label={translate('Language')} required>
              <Field
                name="language"
                component={SelectField}
                options={languageOptions}
                validate={required}
              />
            </FormGroup>
            <FormGroup controlId="content" label={translate('Content')}>
              <Field name="content" component={MarkdownEditor} />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
