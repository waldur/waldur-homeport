import { FC, useMemo } from 'react';
import { Field, Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { paymentProfilesCreate, paymentProfilesEnable } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { getPaymentProfileTypeOptions } from '@/customer/payment-profiles/utils';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentCustomer } from '@/workspace/actions';
import { useCustomer } from '@/workspace/hooks';

import { getCustomer as getCustomerApi } from '../utils';

import { PaymentProfileFormFields } from './PaymentProfileFormFields';

export const PaymentProfileCreateDialog: FC<any> = (props) => {
  const dispatch = useDispatch();

  const customer = useCustomer();

  const paymentProfileTypeOptions = useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  const addPaymentProfileMutation = useManagedMutation<any, any, any>({
    mutationFn: async (formData) => {
      const paymentProfile = await paymentProfilesCreate({
        body: {
          is_active: false,
          name: formData.name,
          organization: customer.url,
          payment_type: formData.payment_type.value,
          attributes: {
            end_date: formData.end_date,
            agreement_number: formData.agreement_number,
            contract_sum: formData.contract_sum,
          },
        },
      }).then((response) => response.data);
      if (paymentProfile?.uuid && formData.enabled) {
        await paymentProfilesEnable({ path: { uuid: paymentProfile.uuid } });
      }
      return formData;
    },
    successMessage: translate('Payment profile has been created.'),
    errorMessage: translate('Unable to create payment profile.'),
    refetch: props.resolve.refetch,
    onSuccess: async () => {
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    },
  });

  return (
    <Form
      onSubmit={(values) => addPaymentProfileMutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Add payment profile')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Submit')}
                />
              </>
            }
          >
            <PaymentProfileFormFields
              paymentProfileTypeOptions={paymentProfileTypeOptions}
            />

            <Field
              name="enabled"
              render={({ input }) => (
                <AwesomeCheckbox
                  {...input}
                  type="checkbox"
                  id="payment-profile-enabled"
                  label={translate('Enable profile after creation')}
                />
              )}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
