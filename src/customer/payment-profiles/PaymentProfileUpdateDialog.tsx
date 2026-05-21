import { FC, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useDispatch } from 'react-redux';
import { paymentProfilesPartialUpdate } from 'waldur-js-client';

import {
  getInitialValues,
  getPaymentProfileTypeOptions,
} from '@/customer/payment-profiles/utils';
import { SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentCustomer } from '@/workspace/actions';
import { useCustomer } from '@/workspace/hooks';

import { getCustomer as getCustomerApi } from '../utils';

import { PaymentProfileFormFields } from './PaymentProfileFormFields';

export const PaymentProfileUpdateDialog: FC<any> = (props) => {
  const dispatch = useDispatch();

  const customer = useCustomer();

  const paymentProfileTypeOptions = useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  const initialValues = useMemo(() => {
    const values = getInitialValues(props.resolve.profile);
    return {
      ...values,
      payment_type: paymentProfileTypeOptions.find(
        (opt) => opt.value === values.payment_type,
      ),
    };
  }, [props.resolve.profile, paymentProfileTypeOptions]);

  const updateMutation = useManagedMutation<any, any, any>({
    mutationFn: (formData) =>
      paymentProfilesPartialUpdate({
        path: { uuid: props.resolve.profile.uuid },
        body: {
          name: formData.name,
          payment_type: formData.payment_type.value,
          attributes: {
            end_date: formData.end_date,
            agreement_number: formData.agreement_number,
            contract_sum: formData.contract_sum,
          },
        },
      }),
    successMessage: translate('Payment profile has been updated.'),
    errorMessage: translate('Unable to update payment profile.'),
    refetch: props.resolve.refetch,
    onSuccess: async () => {
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    },
  });

  return (
    <Form
      onSubmit={(values) => updateMutation.mutateAsync(values)}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Update payment profile')}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Update')}
                />
              </>
            }
          >
            <PaymentProfileFormFields
              paymentProfileTypeOptions={paymentProfileTypeOptions}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
