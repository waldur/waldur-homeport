import { FunctionComponent } from 'react';
import { useFormState } from 'react-final-form';

import { WizardFormStepProps } from '@/form/WizardForm';
import { WizardForm } from '@/form/WizardForm';
import { OptionsForm } from '@/marketplace/common/OptionsForm';

export const ResourceRequestWizardFormThirdPage: FunctionComponent<
  WizardFormStepProps
> = (props) => {
  const { values } = useFormState({
    subscription: { values: true },
  });
  const { mainOffering, offering } = values;
  const _offering = mainOffering || offering;
  return (
    <WizardForm {...props}>
      {_offering?.options ? <OptionsForm options={_offering.options} /> : null}
    </WizardForm>
  );
};
