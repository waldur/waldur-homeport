import * as React from 'react';
import { useState } from 'react';
import { connect } from 'react-redux';
import { Option } from 'react-select';
import { compose } from 'redux';
import { reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { ADD_PAYMENT_PROFILE_FORM_ID } from '@waldur/customer/payment-profiles/constants';
import { addPaymentProfile } from '@waldur/customer/payment-profiles/store/actions';
import { getPaymentProfileTypeOptions } from '@waldur/customer/payment-profiles/utils';
import {
  FormContainer,
  SelectField,
  StringField,
  SubmitButton,
  TextField,
} from '@waldur/form-react';
import { DateField } from '@waldur/form-react/DateField';
import { translate } from '@waldur/i18n';

const PaymentProfileCreate = props => {
  const [
    showAgreementNumberAndEndDate,
    setShowAgreementNumberAndEndDate,
  ] = useState(false);

  const paymentProfileTypeOptions = React.useMemo(
    () => getPaymentProfileTypeOptions(),
    [],
  );

  return (
    <form
      onSubmit={props.handleSubmit(props.submitRequest)}
      className="form-horizontal"
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
            setShowAgreementNumberAndEndDate(value.value === 'fixed_price')
          }
        />

        {showAgreementNumberAndEndDate ? (
          <DateField name="end_date" label={translate('End date')} />
        ) : null}

        {showAgreementNumberAndEndDate && (
          <TextField
            name="agreement_number"
            label={translate('Agreement number')}
            maxLength={150}
          />
        )}

        <div className="form-group">
          <div
            className="col-sm-8 col-sm-offset-2"
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <SubmitButton
              disabled={props.invalid}
              submitting={props.submitting}
              label={translate('Submit')}
            />
          </div>
        </div>
      </FormContainer>
    </form>
  );
};

const mapDispatchToProps = dispatch => ({
  submitRequest: formData => dispatch(addPaymentProfile(formData)),
});

const connector = connect(null, mapDispatchToProps);

const enhance = compose(
  connector,
  reduxForm({
    form: ADD_PAYMENT_PROFILE_FORM_ID,
  }),
);

export const PaymentProfileCreateContainer = enhance(PaymentProfileCreate);
