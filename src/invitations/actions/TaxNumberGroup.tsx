import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const TaxNumberGroup: FunctionComponent<{ name; disabled }> = ({
  name,
  disabled,
}) =>
  isFeatureVisible('invitation.show_tax_number') ? (
    <InputGroup
      name={name}
      label={
        ENV.plugins.WALDUR_CORE.INVITATION_TAX_NUMBER_LABEL ||
        translate('Tax number')
      }
      required={isFeatureVisible('invitation.tax_number_required')}
      disabled={disabled}
    />
  ) : null;
