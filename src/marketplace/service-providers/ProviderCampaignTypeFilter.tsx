import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';

export const ProviderCampaignTypeFilter: FunctionComponent<{}> = () => (
  <Field
    name="discount_type"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select type...')}
        options={[
          { value: 'discount', label: translate('Discount') },
          { value: 'special_price', label: translate('Special price') },
        ]}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        isMulti={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
