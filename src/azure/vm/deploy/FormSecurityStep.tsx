import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { FormSSHPublicKeysField } from '@/openstack/openstack-instance/deploy/FormSSHPublicKeysField';

export const FormSecurityStep = (props: FormStepProps) => (
  <VStepperFormStepCard
    title={translate('Security')}
    id={props.id}
    disabled={props.disabled}
    disabledTooltip={props.disabledTooltip}
  >
    <FormSSHPublicKeysField change={props.change} />
  </VStepperFormStepCard>
);
