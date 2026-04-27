import { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm } from 'redux-form';
import { paymentProfilesPartialUpdate } from 'waldur-js-client';

import { required } from '@/core/validators';
import { EDIT_PAYMENT_PROFILE_FORM_ID } from '@/customer/payment-profiles/constants';
import {
  getInitialValues,
  getPaymentProfileTypeOptions,
} from '@/customer/payment-profiles/utils';
import {
  FormContainer,
  NumberField,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@/form';
import { DateField } from '@/form/DateField';
import { translate } from '@/i18n';
import { closeModalDialog } from '@/modal/actions';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { showSuccess, showErrorResponse } from '@/store/notify';
import { setCurrentCustomer } from '@/workspace/actions';
import { getCustomer } from '@/workspace/selectors';

import { getCustomer as getCustomerApi } from '../utils';

const PaymentProfileUpdateDialog: FunctionComponent<any> = (props) => {
  const dispatch = useDispatch();
  useEffect(() => {
    props.initialize(getInitialValues(props.resolve.profile));
  }, [props.resolve.profile]);

  const [isFixedPrice, setIsFixedPrice] = useState(
    props.resolve.payment_type === 'fixed_price',
  );

  const paymentProfileTypeOptions = useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  const customer = useSelector(getCustomer);

  const submitRequest = async (formData) => {
    try {
      await paymentProfilesPartialUpdate({
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
      });
      dispatch(showSuccess(translate('Payment profile has been updated.')));
      dispatch(closeModalDialog());
      await props.resolve.refetch();
      const updatedCustomer = await getCustomerApi(customer.uuid);
      dispatch(setCurrentCustomer(updatedCustomer));
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to update payment profile.'),
        ),
      );
    }
  };

  return (
    <form onSubmit={props.handleSubmit(submitRequest)}>
      <ModalDialog
        title={translate('Update payment profile')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Update')}
            />
          </>
        }
      >
        <FormContainer submitting={false} clearOnUnmount={false}>
          <StringField
            name="name"
            label={translate('Name')}
            required={true}
            validate={required}
            maxLength={150}
          />

          <SelectField
            name="payment_type"
            label={translate('Type')}
            required={true}
            options={paymentProfileTypeOptions}
            isClearable={false}
            validate={required}
            onChange={(value: any) =>
              setIsFixedPrice(value.value === 'fixed_price')
            }
          />

          {isFixedPrice ? (
            <DateField name="end_date" label={translate('End date')} />
          ) : null}

          {isFixedPrice && (
            <TextField
              name="agreement_number"
              label={translate('Agreement number')}
              maxLength={150}
            />
          )}

          {isFixedPrice && (
            <NumberField
              name="contract_sum"
              label={translate('Contract sum')}
            />
          )}
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

export const PaymentProfileUpdateDialogContainer = reduxForm({
  form: EDIT_PAYMENT_PROFILE_FORM_ID,
})(PaymentProfileUpdateDialog);
