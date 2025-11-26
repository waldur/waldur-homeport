import { Form, Field } from 'react-final-form';
import { userAgreementsCreate } from 'waldur-js-client';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { required } from '@waldur/core/validators';
import { SelectField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';
import { useModal } from '@waldur/modal/hooks';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { useNotify } from '@waldur/store/hooks';

export const UserAgreementCreateDialog = ({ resolve }) => {
  const { showErrorResponse, showSuccess } = useNotify();
  const { closeDialog } = useModal();

  const onSubmit = async (formValues) => {
    try {
      await userAgreementsCreate({
        body: {
          agreement_type: formValues.agreement_type.value,
          content: formValues.content,
        },
      });
      showSuccess(translate('User agreement has been created'));
      closeDialog();
      await resolve.refetch();
    } catch (error) {
      showErrorResponse(error, translate('Unable to create a user agreement.'));
    }
  };

  return (
    <Form
      onSubmit={onSubmit}
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
            <FormGroup controlId="content" label={translate('Content')}>
              <Field name="content" component={TextField as any} />
            </FormGroup>
          </ModalDialog>
        </form>
      )}
    />
  );
};
