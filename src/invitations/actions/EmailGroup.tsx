import * as React from 'react';

import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const EmailGroup = ({ disabled }) => (
  <InputGroup
    name="email"
    type="email"
    label={translate('E-mail')}
    required={true}
    disabled={disabled}
  />
);
