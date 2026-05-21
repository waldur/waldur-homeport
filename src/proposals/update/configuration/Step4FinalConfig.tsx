import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { FormContainer, TextField } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const Step4FinalConfig: FC<WizardFormStepProps> = (props) => {
  const { submitting } = useFormState({
    subscription: { submitting: true },
  });

  return (
    <WizardForm {...props}>
      <FormContainer submitting={submitting} className="size-lg">
        <TextField
          name="description"
          maxLength={1000}
          label={translate('Description')}
          placeholder={translate('Enter a description...')}
        />
      </FormContainer>
    </WizardForm>
  );
};
