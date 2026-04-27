import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { FormSSHPublicKeysField } from '@/openstack/openstack-instance/deploy/FormSSHPublicKeysField';

export const FormSSHPublicKeysStep = (props: FormStepProps) => {
  return (
    <VStepperFormStepCard
      title={translate('SSH public keys')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <FormSSHPublicKeysField change={props.change} />
    </VStepperFormStepCard>
  );
};
