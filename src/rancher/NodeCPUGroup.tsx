import * as React from 'react';
import { Field } from 'redux-form';

import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { IntegerUnitField } from './IntegerUnitField';

export const NodeCPUGroup = () => (
  <FormGroup
    label={translate('CPU')}
    required={true}>
    <Field
      name="cpu"
      units={translate('cores')}
      component={IntegerUnitField}
    />
  </FormGroup>
);
