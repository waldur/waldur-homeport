import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';

export const ComponentBooleanDefaultLimitField: FunctionComponent = () => (
  <FormGroup space={5}>
    <Field
      name="default_limit"
      component={AwesomeCheckboxField}
      label={translate('Enable by default')}
      parse={Boolean}
      normalize={(v) => (v ? 1 : 0)}
      size="sm"
      alignMiddle
    />
  </FormGroup>
);
