import { useMemo } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { FormGroup } from '../../FormGroup';

const INTERNAL_NAME_PATTERN = new RegExp('^[a-zA-Z0-9_\\-/:]+$');

const validateInternalName = (value: string) =>
  !value.match(INTERNAL_NAME_PATTERN)
    ? translate(
        'Please use Latin letters, numbers, underscores, hyphens, slashes, and colons only.',
      )
    : undefined;

const internalNameValidators = [required, validateInternalName];

const composeValidators =
  (...validators) =>
  (value, allValues, meta) =>
    validators.reduce(
      (error, validator) => error || validator(value, allValues, meta),
      undefined,
    );

export const InternalNameField = () => {
  const validators = useMemo(
    () => composeValidators(...internalNameValidators),
    [],
  );

  return (
    <FormGroup
      label={translate('Internal name')}
      required={true}
      description={translate(
        'Technical name intended for integration and automated reporting. Please use Latin letters without spaces only.',
      )}
    >
      <Field
        name="name"
        validate={validators}
        parse={(v) => v.replace('.', '')}
        component={InputField as any}
      />
    </FormGroup>
  );
};
