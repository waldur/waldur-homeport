import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { useFormState } from 'react-final-form';

import { TextGroup } from '@/form';
import { translate } from '@/i18n';
import { WizardForm, WizardFormStepProps } from '@/wizard';

export const Step3FinalConfig: FC<WizardFormStepProps> = (props) => {
  const { submitting } = useFormState({ subscription: { submitting: true } });
  return (
    <WizardForm {...props}>
      <div className="size-lg">
        <div
          className="alert alert-warning d-flex align-items-center"
          role="alert"
        >
          <span className="svg-icon svg-icon-2 me-2">
            <WarningCircleIcon weight="bold" />
          </span>
          <span className="fw-bold">
            {translate(
              'Resource name will be auto-generated on resource creation.',
            )}
          </span>
        </div>

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
