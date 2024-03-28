import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { FormAbstractVolumeStep } from '@waldur/openstack/openstack-instance/deploy/FormAbstractVolumeStep';

export const FormVolumeStep = (props: FormStepProps) => (
  <FormAbstractVolumeStep
    typeField="attributes.type"
    sizeField="attributes.size"
    title={translate('Volume')}
    optional={false}
    {...props}
  />
);
