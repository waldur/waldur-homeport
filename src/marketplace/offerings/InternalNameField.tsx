import { FunctionComponent } from 'react';

import { composeValidators, required } from '@/core/validators';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

import { INTERNAL_NAME_PATTERN } from './internalName';

interface InternalNameFieldProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
}

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
  return (
    <StringGroup
      name={props.name}
      validate={validators}
      parse={(v) => v?.replace('.', '')}
      label={translate('Internal name')}
      required={true}
      tooltip={translate(
        'Technical name intended for integration and automated reporting. Please use Latin letters without spaces only.',
      )}
      tooltipEnd={true}
      space={5}
      disabled={props.disabled}
      readOnly={props.readOnly}
    />
  );
};
