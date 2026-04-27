import { WarningCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { FormContainer, TextField } from '@/form';
import { WizardForm, WizardFormStepProps } from '@/form/WizardForm';
import { translate } from '@/i18n';

export const Step3FinalConfig: FC<WizardFormStepProps> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        return (
          <FormContainer
            submitting={wizardProps.submitting}
            className="size-lg"
          >
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

            <TextField
              name="attributes.description"
              maxLength={1000}
              label={translate('Description')}
            />
          </FormContainer>
        );
      }}
    </WizardForm>
  );
};
