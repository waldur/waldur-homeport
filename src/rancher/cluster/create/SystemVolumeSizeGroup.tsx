import { FC } from 'react';

import { required } from '@/core/validators';
import { NumberGroup } from '@/form';
import { translate } from '@/i18n';
import { formatIntField, parseIntField } from '@/marketplace/common/utils';

export const SystemVolumeSizeGroup: FC = () => (
  <NumberGroup
    label={translate('System volume size')}
    required={true}
    name="system_volume_size"
    unit={translate('GB')}
    parse={parseIntField}
    format={formatIntField}
    validate={required}
  />
);
