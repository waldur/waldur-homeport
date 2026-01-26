import { Field } from 'react-final-form';

import { required } from '@waldur/core/validators';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../../FormGroup';

import { FIELD_TYPES } from './constants';

export const OptionTypeGroup = () => (
  <FormGroup label={translate('Type')} required={true}>
    <Field
      name="type"
      validate={required}
      render={({ input }) => (
        <Select
          value={input.value}
          onChange={(value) => input.onChange(value)}
          options={FIELD_TYPES}
          isClearable={false}
        />
      )}
    />
  </FormGroup>
);
