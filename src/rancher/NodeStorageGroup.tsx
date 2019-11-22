import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { IntegerUnitField } from './IntegerUnitField';

export const NodeStorageGroup = () => (
  <FormGroup
    label={translate('Storage')}
    required={true}>
    <Field
      name="storage"
      units={translate('GB')}
      component={IntegerUnitField}
    />
  </FormGroup>
);
