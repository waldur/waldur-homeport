import { StepCard } from 'waldur-ui';

import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { FormSSHPublicKeysField } from '@/openstack/openstack-instance/deploy/FormSSHPublicKeysField';

export const FormSSHPublicKeysStep = (props: FormStepProps) => {
  return (
    <StepCard
      title={translate('SSH public keys')}
      id={props.id}
      disabled={props.disabled}
      disabledReason={props.disabledReason}
    >
      <FormSSHPublicKeysField />
    </StepCard>
  );
};
