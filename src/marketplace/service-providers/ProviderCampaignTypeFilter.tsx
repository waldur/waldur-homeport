import { FunctionComponent } from 'react';
import { Props as SelectProps } from 'react-select';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const getTypes = () => [
  { value: 'discount', label: translate('Discount') },
  { value: 'special_price', label: translate('Special price') },
];

export const ProviderCampaignTypeFilter: FunctionComponent<{
  reactSelectProps?: Partial<SelectProps>;
}> = (props) => (
  <Field
    name="discount_type"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select type...')}
        options={getTypes()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        {...props.reactSelectProps}
      />
    )}
  />
);
