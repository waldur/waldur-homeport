import React from 'react';
import { Field } from 'react-final-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@/form/themed-select';
import { translate } from '@/i18n';
import { CallOffering } from '@/proposals/types';

export const CallOfferingFilter: React.FC<{
  options?: Partial<Pick<CallOffering, 'offering_name' | 'offering_uuid'>>[];
}> = ({ options = [] }) => (
  <Field
    name="offering"
    render={(fieldProps) => (
      <Select
        placeholder={translate('Select offering...')}
        options={options.map((op) => ({
          offering_name: op.offering_name,
          offering_uuid: op.offering_uuid,
        }))}
        value={fieldProps.input.value}
        onChange={(value) => fieldProps.input.onChange(value)}
        isClearable={true}
        getOptionLabel={(option) => option.offering_name}
        getOptionValue={(option) => option.offering_uuid}
        {...REACT_SELECT_TABLE_FILTER}
      />
    )}
  />
);
