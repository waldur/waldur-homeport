import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { Select } from '@/form/select';
import { translate } from '@/i18n';

export const getOrderTypeOptions = () => [
  { value: 'Create', label: translate('Create') },
  { value: 'Update', label: translate('Update') },
  { value: 'Terminate', label: translate('Terminate') },
];

export const OrderTypeFilter: FunctionComponent = () => {
  return (
    <Field
      name="type"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select type...')}
          options={getOrderTypeOptions()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          variant="tableFilter"
        />
      )}
    />
  );
};
