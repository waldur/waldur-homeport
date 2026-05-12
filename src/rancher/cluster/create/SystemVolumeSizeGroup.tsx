import { FC } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { parseIntField, formatIntField } from '@/marketplace/common/utils';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

import { IntegerUnitField } from './IntegerUnitField';

export const SystemVolumeSizeGroup: FC = () => (
  <FormGroup label={translate('System volume size')} required={true}>
    <Field
      name="system_volume_size"
      units={translate('GB')}
      component={IntegerUnitField}
      parse={parseIntField}
      format={formatIntField}
      validate={required}
    />
  </FormGroup>
);
