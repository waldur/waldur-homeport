import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const CivilNumberGroup: FunctionComponent<{ disabled }> = ({
  disabled,
}) => (
  <InputGroup
    name="civil_number"
    label={ENV.invitationCivilNumberLabel || translate('Civil number')}
    required={ENV.invitationCivilNumberRequired}
    disabled={disabled}
    helpText={ENV.invitationCivilCodeHelpText}
  />
);
