import { FunctionComponent } from 'react';

import { ENV } from '@waldur/configs/default';
import { isFeatureVisible } from '@waldur/features/connect';
import { InvitationsFeatures } from '@waldur/FeaturesEnums';
import { translate } from '@waldur/i18n';

import { InputGroup } from './InputGroup';

export const TaxNumberGroup: FunctionComponent<{ name; disabled }> = ({
  name,
  disabled,
}) =>
  isFeatureVisible(InvitationsFeatures.show_tax_number) ? (
    <InputGroup
      name={name}
      label={
        ENV.plugins.WALDUR_CORE.INVITATION_TAX_NUMBER_LABEL ||
        translate('Tax number')
      }
      required={isFeatureVisible(InvitationsFeatures.tax_number_required)}
      disabled={disabled}
    />
  ) : null;
