import * as React from 'react';

import {
  StringField,
  FormContainer,
} from '@waldur/form-react';

export const UserFilterForm = props => (
  <form className="form-vertical">
    <FormContainer
      submitting={props.submitting}>
      <StringField
        label={props.translate('Full name')}
        name="full_name"/>
      <StringField
        label={props.translate('Native name')}
        name="native_name"/>
      <StringField
        label={props.translate('ID code')}
        name="civil_number"/>
      <StringField
        label={props.translate('Email')}
        name="email"/>
    </FormContainer>
  </form>
);
