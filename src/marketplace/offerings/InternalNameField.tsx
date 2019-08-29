import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FieldError } from '@waldur/form-react';
import { translate } from '@waldur/i18n';

import { FormGroup } from './FormGroup';

interface InternalNameFieldProps {
  name: string;
}

const INTERNAL_NAME_PATTERN = new RegExp('^[a-zA-Z][a-zA-Z0-9_]+$');

export const validateInternalName = (value: string) =>
  !value.match(INTERNAL_NAME_PATTERN) ? translate('Please use Latin letters without spaces only.') :
  undefined;

const validators = [required, validateInternalName];

const InputWithError = props => (
  <>
    <input className="form-control" {...props.input}/>
    {props.meta.touched && <FieldError error={props.meta.error} />}
  </>
);

export const InternalNameField = (props: InternalNameFieldProps) => (
  <FormGroup
    label={translate('Internal name')}
    required={true}
    description={translate('Technical name intended for integration and automated reporting. Please use Latin letters without spaces only.')}>
    <Field
      name={props.name}
      type="text"
      validate={validators}
      parse={v => v.replace('.', '')}
      component={InputWithError}
    />
  </FormGroup>
);
