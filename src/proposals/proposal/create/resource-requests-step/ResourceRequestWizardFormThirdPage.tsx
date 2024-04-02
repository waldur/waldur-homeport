import { FunctionComponent } from 'react';

import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';

export const ResourceRequestWizardFormThirdPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { mainOffering } = wizardProps.formValues;
        return mainOffering?.options ? (
          <OptionsForm
            options={mainOffering.options}
            submitting={wizardProps.submitting}
          />
        ) : null;
      }}
    </WizardForm>
  );
};
