import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@/form/themed-select';
import { translate } from '@/i18n';

const getAutoApprovedOptions = () => [
  { value: 'true', label: translate('Yes') },
  { value: 'false', label: translate('No') },
];

export const OrderAutoApprovedFilter: FunctionComponent = () => {
  return (
    <Field
      name="was_auto_approved"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Auto-approved?')}
          options={getAutoApprovedOptions()}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  );
};
