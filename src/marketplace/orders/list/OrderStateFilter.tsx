import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { Option } from '@/marketplace/common/registry';

import { createOrderStateOptions } from '../OrderStates';

interface OrderStateFilterProps {
  options?: () => Option[];
}

export const OrderStateFilter: FunctionComponent<OrderStateFilterProps> = ({
  options,
}) => {
  return (
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={options ? options() : createOrderStateOptions()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          variant="tableFilter"
        />
      )}
    />
  );
};
