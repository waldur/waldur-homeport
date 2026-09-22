import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { AlertItem } from 'waldur-ui';

import { TextGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const Step3FinalConfig: FC<WizardFormStepProps> = (props) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  return (
    <WizardForm {...props}>
      <div className="size-lg">
        <AlertItem
          variant="warning"
          type="floating"
          title={translate(
            'Resource name will be auto-generated on resource creation.',
          )}
          role="alert"
        />

        <TextGroup
          name="attributes.description"
          maxLength={1000}
          label={translate('Description')}
          disabled={submitting}
        />
      </div>
    </WizardForm>
  );
};
