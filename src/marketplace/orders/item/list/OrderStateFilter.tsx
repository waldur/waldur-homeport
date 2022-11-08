import { FunctionComponent } from 'react';
import { Field } from 'redux-form';

import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { Option } from '@waldur/marketplace/common/registry';

export const getOrderStateFilterOption = (): Option[] => [
  { value: 'pending', label: translate('Pending') },
  { value: 'executing', label: translate('Executing') },
  { value: 'done', label: translate('Done') },
  { value: 'erred', label: translate('Erred') },
  { value: 'terminated', label: translate('Terminated') },
];

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
        options={options ? options() : getOrderStateFilterOption()}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
      />
    )}
  />
);
