import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const CivilNumberGroup: FunctionComponent<{ name; disabled }> = ({
  name,
  disabled,
}) => (
  <InputGroup
    name={name}
    label={
      ENV.plugins.WALDUR_CORE.INVITATION_CIVIL_NUMBER_LABEL ||
      translate('Civil number')
    }
    required={isFeatureVisible('invitation.civil_number_required')}
    disabled={disabled}
    helpText={ENV.plugins.WALDUR_CORE.INVITATION_CIVIL_NUMBER_HELP_TEXT}
  />
);
