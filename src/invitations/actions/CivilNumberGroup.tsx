import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const CivilNumberGroup = ({ disabled }) => (
  <InputGroup
    name="civil_number"
    label={ENV.invitationCivilNumberLabel || translate('Civil number')}
    required={ENV.invitationCivilNumberRequired}
    disabled={disabled}
    helpText={ENV.invitationCivilCodeHelpText}
  />
);
