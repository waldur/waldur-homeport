import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const CivilNumberGroup: FunctionComponent<{ disabled }> = ({
  disabled,
}) => (
  <InputGroup
    name="civil_number"
    label={ENV.invitationCivilNumberLabel || translate('Civil number')}
    required={isFeatureVisible('invitation.civil_number_required')}
    disabled={disabled}
    helpText={ENV.invitationCivilCodeHelpText}
  />
);
