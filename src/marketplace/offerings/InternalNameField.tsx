import * as React from 'react';
import { Field } from 'redux-form';

import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';

import { FormGroupWithError } from './FormGroupWithError';

interface InternalNameFieldProps {
  name: string;
}

const INTERNAL_NAME_PATTERN = new RegExp('^[a-zA-Z0-9_]+$');

export const validateInternalName = (value: string) =>
  !value.match(INTERNAL_NAME_PATTERN)
    ? translate('Please use Latin letters without spaces only.')
    : undefined;

const validators = [required, validateInternalName];

export const InternalNameField = (props: InternalNameFieldProps) => (
  <Field
    name={props.name}
    validate={validators}
    parse={v => v.replace('.', '')}
    label={translate('Internal name')}
    required={true}
    description={translate(
      'Technical name intended for integration and automated reporting. Please use Latin letters without spaces only.',
    )}
    component={FormGroupWithError}
  />
);
