import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const getStates = () => [
  { value: '1', label: translate('Draft') },
  { value: '2', label: translate('Active') },
  { value: '3', label: translate('Terminated') },
];

export const ProviderCampaignStateFilter: FunctionComponent<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => (
  <Field
    name="state"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select state...')}
        options={getStates()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        {...props.reactSelectProps}
      />
    )}
  />
);
