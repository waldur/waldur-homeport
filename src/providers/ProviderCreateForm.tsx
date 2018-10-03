import * as React from 'react';

import { FormContainer, FieldError, SubmitButton} from '@waldur/form-react';

import { ProviderFormBody } from './ProviderFormBody';
import { ProviderHelpLink } from './ProviderHelpLink';
import { ProviderNameField } from './ProviderNameField';
import { ProviderTypeField } from './ProviderTypeField';

const Footer = props => (
  <div className="form-group">
    <div className="col-sm-offset-3 col-sm-5">
      <FieldError error={props.error}/>
      <SubmitButton
        submitting={props.submitting}
        label={props.translate('Add provider')}
      />
      <button
        type="button"
        className="btn btn-default m-l-sm"
        onClick={props.onCancel}>
        {props.translate('Cancel')}
      </button>
    </div>
  </div>
);

export const ProviderCreateForm = props => {
  const container = {
    submitting: props.submitting,
    labelClass: 'col-sm-3',
    controlClass: 'col-sm-5',
  };
  return (
    <form
      onSubmit={props.handleSubmit(props.createProvider)}
      className="form-horizontal">
      <FormContainer {...container}>
        {ProviderTypeField(props)}
        <ProviderHelpLink {...props}/>
        {ProviderNameField(props)}
      </FormContainer>
      <ProviderFormBody {...props} container={container}/>
      <Footer {...props}/>
    </form>
  );
};
