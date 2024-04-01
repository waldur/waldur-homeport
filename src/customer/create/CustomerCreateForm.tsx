import { FunctionComponent } from 'react';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { getNameFieldValidators } from '@waldur/core/validators';
import { InputGroup } from '@waldur/customer/create/InputGroup';
import { SubmitButton } from '@waldur/form';
import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { CustomerCreateFormData } from './types';

interface CustomerCreateFormProps extends InjectedFormProps {
  onSubmit(formData: CustomerCreateFormData): void;
}

const PureCustomerCreateForm: FunctionComponent<CustomerCreateFormProps> = (
  props,
) => {
  return (
    <form onSubmit={props.handleSubmit(props.onSubmit)}>
      <InputGroup
        name="name"
        component={InputField}
        required={true}
        label={translate('Name')}
        maxLength={150}
        helpText={translate('Name of your organization.')}
        validate={getNameFieldValidators()}
      />
      <InputGroup
        name="email"
        component={InputField}
        type="email"
        label={translate('Contact email')}
        required={true}
      />
      <SubmitButton
        submitting={props.submitting}
        disabled={props.invalid}
        label={translate('Create organization')}
        className="btn btn-primary ms-4 pull-right"
      />
    </form>
  );
};

export const CustomerCreateForm = reduxForm({ form: 'customerCreate' })(
  PureCustomerCreateForm,
);
