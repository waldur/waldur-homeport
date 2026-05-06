import { FunctionComponent } from 'react';
import { Field as FinalField } from 'react-final-form';
import { Field } from 'redux-form';

import { composeValidators, required } from '@/core/validators';
import { translate } from '@/i18n';

import { FormGroupWithError } from './FormGroupWithError';

interface InternalNameFieldProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
  legacyField?: boolean;
}

const INTERNAL_NAME_PATTERN = new RegExp('^[a-zA-Z0-9_\\-/:]+$');

const validateInternalName = (value: string) =>
  !value || !value.match(INTERNAL_NAME_PATTERN)
    ? translate(
        'Please use Latin letters, numbers, underscores, hyphens, slashes, and colons only.',
      )
    : undefined;

const validators = composeValidators(required, validateInternalName);

export const InternalNameField: FunctionComponent<InternalNameFieldProps> = (
  props,
) => {
  const Component = (props.legacyField ? Field : FinalField) as any;
  return (
    <Component
      name={props.name}
      validate={validators}
      parse={(v) => v?.replace('.', '')}
      label={translate('Internal name')}
      required={true}
      description={translate(
        'Technical name intended for integration and automated reporting. Please use Latin letters without spaces only.',
      )}
      component={FormGroupWithError}
      disabled={props.disabled}
      readOnly={props.readOnly}
    />
  );
};
