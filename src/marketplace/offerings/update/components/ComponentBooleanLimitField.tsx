import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

export const ComponentBooleanLimitField: FunctionComponent = () => (
  <FormGroup space={5}>
    <Field
      name="is_boolean"
      component={AwesomeCheckboxField}
      label={translate('Allow to enable/disable component only')}
      size="sm"
      alignMiddle
    />
  </FormGroup>
);
