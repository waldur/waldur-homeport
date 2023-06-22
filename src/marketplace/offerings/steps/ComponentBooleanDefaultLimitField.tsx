import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentBooleanDefaultLimitField: FunctionComponent = () => (
  <FormGroup>
    <Field
      name="default_limit"
      component={AwesomeCheckboxField}
      label={translate('Enable by default')}
      parse={Boolean}
      normalize={(v) => (v ? 1 : 0)}
    />
  </FormGroup>
);
