import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { parseIntField, formatIntField } from '@/marketplace/common/utils';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

import { IntegerUnitField } from './IntegerUnitField';

export const VolumeSizeGroup: FunctionComponent<{}> = () => (
  <FormGroup label={translate('Volume size')} required={true}>
    <Field
      name="size"
      units={translate('GB')}
      component={IntegerUnitField}
      parse={parseIntField}
      format={formatIntField}
      validate={[required]}
    />
  </FormGroup>
);
