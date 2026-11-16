import { FC } from 'react';

import { WizardForm, WizardFormStepProps } from 'waldur-wizard';

import { required } from '@/core/validators';
import { translate } from '@/i18n';

import { ArrowCustomerMappingAutocomplete } from '../../mappings/ArrowCustomerMappingAutocomplete';

export const Step1SelectCustomer: FC<WizardFormStepProps> = (props) => (
  <WizardForm {...props}>
    <div>
      <p className="text-quaternary mb-4">
        {translate(
          'Select the Arrow customer mapping to import licenses from.',
        )}
      </p>
      <ArrowCustomerMappingAutocomplete
        placeholder={translate('Select an Arrow-mapped customer...')}
        validator={required}
      />
    </div>
  </WizardForm>
);
