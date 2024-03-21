import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';

import { FormAbstractVolumeStep } from './FormAbstractVolumeStep';

export const FormDataVolumeStep = (props: FormStepProps) => (
  <FormAbstractVolumeStep
    {...props}
    title={translate('Data volume')}
    helpText={translate('Detachable and resizable data disk')}
    typeField="attributes.data_volume_type"
    sizeField="attributes.data_volume_size"
    optional={true}
  />
);
