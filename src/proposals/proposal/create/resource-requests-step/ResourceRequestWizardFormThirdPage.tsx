import { FunctionComponent } from 'react';

import { WizardForm, WizardFormStepProps } from '@waldur/form/WizardForm';
import { OptionsForm } from '@waldur/marketplace/common/OptionsForm';

export const ResourceRequestWizardFormThirdPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  return (
    <WizardForm {...props}>
      {(wizardProps) => {
        const { mainOffering, offering } = wizardProps.formValues;
        const _offering = mainOffering || offering;

        return _offering?.options ? (
          <OptionsForm
            options={_offering.options}
            submitting={wizardProps.submitting}
          />
        ) : null;
      }}
    </WizardForm>
  );
};
