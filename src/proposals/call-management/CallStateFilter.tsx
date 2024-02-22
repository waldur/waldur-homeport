import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export interface CallStateFilterOption {
  value: string;
  label: string;
}

export const getStates = (): CallStateFilterOption[] => [
  { value: 'Archived', label: translate('Archived') },
  { value: 'Active', label: translate('Active') },
  { value: 'Draft', label: translate('Draft') },
];

export const CallStateFilter: FunctionComponent = () => (
  <Field
    name="state"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select state...')}
        options={getStates()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isMulti={true}
        isClearable={true}
      />
    )}
  />
);
