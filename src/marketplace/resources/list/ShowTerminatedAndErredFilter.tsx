import React from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const ShowTerminatedAndErredFilter: React.FC<{}> = () => (
  <Field
    name="state"
    component={(fieldProps) => (
      <Select
        options={[
          {
            label: translate('Show only erred'),
            value: 'Erred',
          },
          {
            label: translate('Show only terminated'),
            value: 'Terminated',
          },
        ]}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable
      />
    )}
  />
);
