import { FunctionComponent } from 'react';

import { required } from '@/core/validators';
import { StringGroup } from '@/form';
import { translate } from '@/i18n';

interface DisplayNameFieldProps {
  name: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const DisplayNameField: FunctionComponent<DisplayNameFieldProps> = (
  props,
) => {
  return (
    <StringGroup
      label={translate('Display name')}
      required={true}
      help={translate('Label that is visible to users in Marketplace.')}
      helpEnd
      space={5}
      name={props.name}
      validate={required}
      disabled={props.disabled}
      readOnly={props.readOnly}
    />
  );
};
