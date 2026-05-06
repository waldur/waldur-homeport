import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ComponentBooleanLimitField: FunctionComponent = () => (
  <FormGroup space={5}>
    <Field
      name="is_boolean"
      component={AwesomeCheckboxField as any}
      label={translate('Allow to enable/disable component only')}
      size="sm"
      alignMiddle
    />
  </FormGroup>
);
