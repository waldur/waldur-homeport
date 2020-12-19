import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentBooleanLimitField: FunctionComponent = () => (
  <FormGroup>
    <Field
      name="is_boolean"
      component={AwesomeCheckboxField}
      label={translate('Allow to enable/disable component only')}
    />
  </FormGroup>
);
