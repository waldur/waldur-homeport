import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const TaxNumberGroup: FunctionComponent<{ disabled }> = ({ disabled }) =>
  isFeatureVisible('invitation.show_tax_number') ? (
    <InputGroup
      name="tax_number"
      label={ENV.invitationTaxNumberLabel || translate('Tax number')}
      required={isFeatureVisible('invitation.tax_number_required')}
      disabled={disabled}
    />
  ) : null;
