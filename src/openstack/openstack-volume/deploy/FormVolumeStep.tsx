import { StepCard } from 'waldur-ui';

import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { FormAbstractVolumeFields } from '@/openstack/openstack-instance/deploy/FormAbstractVolumeFields';

export const FormVolumeStep = (props: FormStepProps) => (
  <StepCard
    title={translate('Volume')}
    id={props.id}
    disabled={props.disabled}
    disabledReason={props.disabledReason}
  >
    <FormAbstractVolumeFields
      typeField="attributes.type"
      sizeField="attributes.size"
      typeTitle={translate('Volume type')}
      sizeTitle={translate('Volume size (GB)')}
      optional={false}
      {...props}
    />
  </StepCard>
);
