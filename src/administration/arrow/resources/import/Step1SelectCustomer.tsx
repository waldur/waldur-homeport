import { FC } from 'react';

import { required } from '@/core/validators';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';

import { ArrowCustomerMappingAutocomplete } from '../../mappings/ArrowCustomerMappingAutocomplete';

export const Step1SelectCustomer: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm {...props} submitDisabledInvalid>
      {() => (
        <div>
          <p className="text-muted mb-5">
            {translate(
              'Select the Arrow customer mapping to import licenses from.',
            )}
          </p>
          <ArrowCustomerMappingAutocomplete
            placeholder={translate('Select an Arrow-mapped customer...')}
            validator={required}
          />
        </div>
      )}
    </WizardForm>
  );
};
