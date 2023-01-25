import { useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { required } from '@waldur/core/validators';
import { ADD_PAYMENT_PROFILE_FORM_ID } from '@waldur/customer/payment-profiles/constants';
import { addPaymentProfile } from '@waldur/customer/payment-profiles/store/actions';
import { getPaymentProfileTypeOptions } from '@waldur/customer/payment-profiles/utils';
import {
  FormContainer,
  NumberField,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form';
import { DateField } from '@waldur/form/DateField';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

const PaymentProfileCreate = (props) => {
  const [isFixedPrice, setIsFixedPrice] = useState(false);

  const paymentProfileTypeOptions = useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  return (
    <form onSubmit={props.handleSubmit(props.submitRequest)}>
      <ModalDialog
        title={translate('Add payment profile')}
        footer={
          <>
            <CloseDialogButton />
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </>
        }
      >
        <FormContainer
          submitting={false}
          clearOnUnmount={false}
          floating={true}
        >
          <StringField
            name="name"
            label={translate('Name')}
            required={true}
            validate={required}
            maxLength={150}
          />

          <SelectField
            floating={false}
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

          <Field
            name="enabled"
            component={(prop) => (
              <AwesomeCheckbox
                label={translate('Enable profile after creation')}
                {...prop.input}
              />
            )}
          />
        </FormContainer>
      </ModalDialog>
    </form>
  );
};

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: (formData) =>
    dispatch(
      addPaymentProfile({
        formData,
        refetch: ownProps.resolve.refetch,
      }),
    ),
});

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: ADD_PAYMENT_PROFILE_FORM_ID,
  }),
);

export const PaymentProfileCreateDialog = enhance(PaymentProfileCreate);
