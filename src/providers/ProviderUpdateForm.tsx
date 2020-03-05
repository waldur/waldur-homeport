import * as React from 'react';
import { reduxForm } from 'redux-form';

import { FormContainer, FieldError, SubmitButton } from '@waldur/form-react';
import { TranslateProps } from '@waldur/i18n';

import { ProviderFormBody } from './ProviderFormBody';
import { ProviderNameField } from './ProviderNameField';

export const PureProviderUpdateForm = props => {
  const container = {
    submitting: props.submitting,
    labelClass: 'col-sm-3',
    controlClass: 'col-sm-9',
  };

  return (
    <form
      onSubmit={props.handleSubmit(props.updateProvider)}
      className="form-horizontal"
    >
      <FormContainer {...container}>{ProviderNameField(props)}</FormContainer>
      <ProviderFormBody {...props} container={container} />
      <FieldError error={props.error} />
      <div className="text-center">
        <SubmitButton
          submitting={props.submitting}
          label={props.translate('Save')}
        />
      </div>
    </form>
  );
};

interface OwnProps<FormData = {}> extends TranslateProps {
  updateProvider(data: FormData): void;
}

export const ProviderUpdateForm = reduxForm<{}, OwnProps>({
  form: 'providerUpdate',
})(PureProviderUpdateForm);
