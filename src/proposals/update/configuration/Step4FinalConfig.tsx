import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { TextGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const Step4FinalConfig: FC<WizardFormStepProps> = (props) => {
  const { submitting } = useFormState({
    subscription: { submitting: true },
  });

  return (
    <WizardForm {...props}>
      <div className="size-lg">
        <TextGroup
          name="description"
          maxLength={1000}
          label={translate('Description')}
          placeholder={translate('Enter a description...')}
          disabled={submitting}
        />
      </div>
    </WizardForm>
  );
};
