import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export interface RequestStateFilterOption {
  value: string;
  label: string;
}

export const getStates = (): RequestStateFilterOption[] => [
  { value: 'draft', label: translate('Draft') },
  { value: 'pending', label: translate('Pending') },
  { value: 'approved', label: translate('Approved') },
  { value: 'rejected', label: translate('Rejected') },
  { value: 'canceled', label: translate('Canceled') },
];

export const RequestStateFilter: FunctionComponent = () => (
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
