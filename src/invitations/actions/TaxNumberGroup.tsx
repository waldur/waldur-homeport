import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const TaxNumberGroup: FunctionComponent<{ disabled }> = ({ disabled }) =>
  ENV.invitationShowTaxNumber ? (
    <InputGroup
      name="tax_number"
      label={ENV.invitationTaxNumberLabel || translate('Tax number')}
      required={ENV.invitationTaxNumberRequired}
      disabled={disabled}
    />
  ) : null;
