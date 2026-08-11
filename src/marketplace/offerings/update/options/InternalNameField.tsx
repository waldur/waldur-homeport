import { useMemo } from 'react';

import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

import { INTERNAL_NAME_PATTERN } from '../../internalName';

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
    <StringGroup
      label={translate('Internal name')}
      required={true}
      description={translate(
        'Technical name intended for integration and automated reporting. Please use Latin letters without spaces only.',
      )}
      name="name"
      validate={validators}
      parse={(v) => v.replace('.', '')}
    />
  );
};
