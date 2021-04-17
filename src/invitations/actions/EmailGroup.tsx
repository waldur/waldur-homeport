import { FunctionComponent } from 'react';

import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const EmailGroup: FunctionComponent<{ disabled }> = ({ disabled }) => (
  <InputGroup
    name="email"
    type="email"
    label={translate('Email')}
    required={true}
    disabled={disabled}
  />
);
