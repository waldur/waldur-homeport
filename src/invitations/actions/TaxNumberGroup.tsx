import * as React from 'react';

import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const TaxNumberGroup = ({ disabled }) =>
  ENV.invitationShowTaxNumber ? (
    <InputGroup
      name="tax_number"
      label={ENV.invitationTaxNumberLabel || translate('Tax number')}
      required={ENV.invitationTaxNumberRequired}
      disabled={disabled}
    />
  ) : null;
