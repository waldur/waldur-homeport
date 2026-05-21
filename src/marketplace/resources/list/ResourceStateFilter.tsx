import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { Props as SelectProps } from 'react-select';
import { ResourceState } from 'waldur-js-client';

import { REACT_MULTI_SELECT_TABLE_FILTER, Select } from '@/form/themed-select';
import { translate } from '@/i18n';

export const getStates = (): Array<{ value: ResourceState; label: string }> => [
  { value: 'Creating', label: translate('Creating') },
  { value: 'OK', label: translate('OK') },
  { value: 'Erred', label: translate('Erred') },
  { value: 'Updating', label: translate('Updating') },
  { value: 'Terminating', label: translate('Terminating') },
];

export const ResourceStateFilter: FunctionComponent<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => {
  return (
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={getStates()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          {...REACT_MULTI_SELECT_TABLE_FILTER}
          {...props.reactSelectProps}
        />
      )}
    />
  );
};
