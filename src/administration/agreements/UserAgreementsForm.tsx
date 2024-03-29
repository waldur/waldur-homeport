import { useDispatch } from 'react-redux';

import { SubmitButton } from '@waldur/auth/SubmitButton';
import { get, patch } from '@waldur/core/api';
import { FormContainer, TextField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showSuccess } from '@waldur/store/notify';

export const loadUserAgreements = async () => {
  const response = await get('user-agreements/');
  return response.data;
};

export interface UserAgreementsFormData {
  url: string;
  agreement_type: string;
  content: string;
}

const agreementTypeLabelMap = {
  pp: 'Privacy policy',
  tos: 'Terms of service',
};

export const UserAgreementsForm = ({
  submitting,
  formValues,
  handleSubmit,
  initialValues,
  refetch,
}: {
  submitting: boolean;
  formValues: UserAgreementsFormData;
  handleSubmit;
  initialValues;
  refetch;
}) => {
  const dispatch = useDispatch();
  const callback = async (formData: UserAgreementsFormData) => {
    await patch(formValues.url, formData);
    await refetch();
    dispatch(showSuccess(translate('User agreement was updated')));
    dispatch(closeModalDialog());
  };
  const agreementType =
    agreementTypeLabelMap[initialValues.agreement_type.toLowerCase()];
  return (
    <form onSubmit={handleSubmit(callback)}>
      <FormContainer submitting={submitting}>
        <TextField
          label={translate(agreementType)}
          name="content"
          style={{ height: '520px' }}
        />
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
