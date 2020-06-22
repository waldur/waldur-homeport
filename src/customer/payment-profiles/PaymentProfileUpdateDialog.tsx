import * as React from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';
import { Option } from 'react-select';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { EDIT_PAYMENT_PROFILE_FORM_ID } from '@waldur/customer/payment-profiles/constants';
import { editPaymentProfile } from '@waldur/customer/payment-profiles/store/actions';
import {
  getInitialValues,
  getPaymentProfileTypeOptions,
} from '@waldur/customer/payment-profiles/utils';
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

const PaymentProfileUpdateDialog = (props) => {
  const [isFixedPrice, setIsFixedPrice] = useState(
    props.resolve.payment_type === 'fixed_price',
  );

  const paymentProfileTypeOptions = React.useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  return (
    <form
      onSubmit={props.handleSubmit(props.submitRequest)}
      className="form-horizontal"
    >
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
        <FormContainer
          submitting={false}
          labelClass="col-sm-2"
          controlClass="col-sm-8"
          clearOnUnmount={false}
        >
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
            clearable={false}
            validate={required}
            onChange={(value: Option<any>) =>
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

const mapStateToProps = (_state, ownProps) => ({
  initialValues: getInitialValues(ownProps),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  submitRequest: (formData) =>
    dispatch(editPaymentProfile(ownProps.resolve.uuid, formData)),
});

const connector = connect(mapStateToProps, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: EDIT_PAYMENT_PROFILE_FORM_ID,
  }),
);

export const PaymentProfileUpdateDialogContainer = enhance(
  PaymentProfileUpdateDialog,
);
