import { FC } from 'react';

import { FormContainer, TextField } from '@/form';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';

export const Step4FinalConfig: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => (
        <FormContainer submitting={wizardProps.submitting} className="size-lg">
          <TextField
            name="description"
            maxLength={1000}
            label={translate('Description')}
            placeholder={translate('Enter a description...')}
          />
        </FormContainer>
      )}
    </WizardForm>
  );
};
