import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { translate } from '@waldur/i18n';
import { FormGroup } from '@waldur/marketplace/offerings/FormGroup';

import { projectKindOptions } from '../utils';

const kindOptions = Object.values(projectKindOptions);

export const KindGroup = () => {
  return (
    <FormGroup label={translate('Project kind')} required>
      <Field
        component={SelectField}
        name="kind"
        options={kindOptions}
        validate={required}
        simpleValue
      />
    </FormGroup>
  );
};
