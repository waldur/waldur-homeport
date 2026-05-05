import { FC, useMemo, useState } from 'react';
import { Form, Field, FormSpy } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { paymentProfilesPartialUpdate } from 'waldur-js-client';

import { required } from '@/core/validators';
import {
  getInitialValues,
  getPaymentProfileTypeOptions,
} from '@/customer/payment-profiles/utils';
import {
  FormGroup,
  NumberField,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';

import { getCustomer as getCustomerApi } from '../utils';

export const PaymentProfileUpdateDialog: FC<any> = (props) => {
  const [isFixedPrice, setIsFixedPrice] = useState(
    props.resolve.profile.payment_type === 'fixed_price',
  );
  const dispatch = useDispatch();

  const customer = useSelector(getCustomer);

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
          <FormSpy
            subscription={{ values: true }}
            onChange={(state) => {
              setIsFixedPrice(
                state.values.payment_type?.value === 'fixed_price',
              );
            }}
          />
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
            <Field
              name="name"
              label={translate('Name')}
              component={FormGroup as any}
              required={true}
              validate={required}
            >
              <StringField maxLength={150} />
            </Field>

            <Field
              name="payment_type"
              label={translate('Type')}
              component={FormGroup as any}
              required={true}
              validate={required}
            >
              <SelectField
                options={paymentProfileTypeOptions}
                isClearable={false}
              />
            </Field>

            {isFixedPrice && (
              <Field
                name="end_date"
                label={translate('End date')}
                component={FormGroup as any}
              >
                <DateField />
              </Field>
            )}

            {isFixedPrice && (
              <Field
                name="agreement_number"
                label={translate('Agreement number')}
                component={FormGroup as any}
              >
                <TextField maxLength={150} />
              </Field>
            )}

            {isFixedPrice && (
              <Field
                name="contract_sum"
                label={translate('Contract sum')}
                component={FormGroup as any}
              >
                <NumberField />
              </Field>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
