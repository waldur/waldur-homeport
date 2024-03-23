import { useDispatch } from 'react-redux';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { post } from '@waldur/core/api';
import { FormContainer, SelectField, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

interface CreateUserAgreementsFormData {
  agreement_type: any;
  content: string;
}

export const CreateUserAgreementsForm = ({
  submitting,
  handleSubmit,
  refetch,
  formValues,
}: {
  submitting: boolean;
  formValues: CreateUserAgreementsFormData;
  handleSubmit;
  refetch;
}) => {
  const dispatch = useDispatch();
  const callback = async () => {
    try {
      await post('/user-agreements/', {
        agreement_type: formValues.agreement_type.value,
        content: formValues.content,
      });

      dispatch(showSuccess(translate('User agreement has been created')));
      dispatch(closeModalDialog());
      await refetch();
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to create a user agreement.'),
        ),
      );
    }
  };
  return (
    <form onSubmit={handleSubmit(callback)}>
      <FormContainer submitting={submitting}>
        <SelectField
          name="agreement_type"
          label={translate('Agreement type')}
          required={true}
          options={[
            { label: translate('Privacy policy'), value: 'PP' },
            { label: translate('Terms of service'), value: 'TOS' },
          ]}
        />

        <TextField name="content" label={translate('Content')} />
        <div className="mb-5 text-end">
          <SubmitButton
            block={false}
            submitting={submitting}
            label={translate('Save')}
          />
        </div>
      </FormContainer>
    </form>
  );
};
