import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const OrderTypeFilter: FunctionComponent = () => (
  <Field
    name="type"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select type...')}
        options={[
          { value: 'Create', label: translate('Create') },
          { value: 'Update', label: translate('Update') },
          { value: 'Terminate', label: translate('Terminate') },
        ]}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
      />
    )}
  />
);
