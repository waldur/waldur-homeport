import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';

import { createOrderStateOptions } from '../OrderStates';

interface OrderStateFilterProps {
  options?: () => Option[];
}

export const OrderStateFilter: FunctionComponent<OrderStateFilterProps> = ({
  options,
}) => (
  <Field
    name="state"
    component={(fieldProps) => (
      <Select
        placeholder={translate('Select state...')}
        options={options ? options() : createOrderStateOptions()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
