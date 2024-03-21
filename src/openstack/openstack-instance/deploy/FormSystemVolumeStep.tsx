import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

import { FormAbstractVolumeStep } from './FormAbstractVolumeStep';

export const FormSystemVolumeStep = (props: FormStepProps) => (
  <FormAbstractVolumeStep
    {...props}
    title={translate('System volume')}
    helpText={translate('Non-detachable and non-resizable boot disk')}
    typeField="attributes.system_volume_type"
    sizeField="attributes.system_volume_size"
    optional={false}
  />
);
