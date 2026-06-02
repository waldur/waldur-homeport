import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { required } from '@/core/validators';
import { FormGroup } from '@/form';
import { translate } from '@/i18n';
import { parseIntField, formatIntField } from '@/marketplace/common/utils';

import { IntegerUnitField } from './IntegerUnitField';

export const VolumeSizeGroup: FunctionComponent<{ name?: string }> = ({
  name = 'size',
}) => (
  <FormGroup label={translate('Volume size')} required={true}>
    <Field
      name={name}
      units={translate('GB')}
      component={IntegerUnitField}
      parse={parseIntField}
      format={formatIntField}
      validate={required}
    />
  </FormGroup>
);
