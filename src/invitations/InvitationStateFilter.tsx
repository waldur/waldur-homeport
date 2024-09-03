import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const choices = [
  {
    label: translate('Requested'),
    value: 'Requested',
  },
  {
    label: translate('Rejected'),
    value: 'Rejected',
  },
  {
    label: translate('Pending'),
    value: 'Pending',
  },
  {
    label: translate('Canceled'),
    value: 'Canceled',
  },
  {
    label: translate('Expired'),
    value: 'Expired',
  },
  {
    label: translate('Accepted'),
    value: 'Accepted',
  },
];

export const formatInvitationState = (value) => {
  const choice = choices.find((choice) => choice.value === value);
  return choice ? choice.label : null;
};

export const InvitationStateFilter = () => (
  <TableFilterItem title={translate('State')} name="state">
    <Field
      name="state"
      component={(fieldProps) => (
        <Select
          placeholder={translate('Select state...')}
          options={choices}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          isMulti={true}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);
