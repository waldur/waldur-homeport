import { FC, useMemo, useState } from 'react';
import { Form, Field, FormSpy } from 'react-final-form';
import { useDispatch, useSelector } from 'react-redux';
import { paymentProfilesCreate, paymentProfilesEnable } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { required } from '@/core/validators';
import { getPaymentProfileTypeOptions } from '@/customer/payment-profiles/utils';
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

export const PaymentProfileCreateDialog: FC<any> = (props) => {
  const [isFixedPrice, setIsFixedPrice] = useState(false);
  const dispatch = useDispatch();

  const customer = useSelector(getCustomer);

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
          <FormSpy
            subscription={{ values: true }}
            onChange={(state) => {
              setIsFixedPrice(
                state.values.payment_type?.value === 'fixed_price',
              );
            }}
          />
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
