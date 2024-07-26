import { Field } from 'redux-form';

import { REACT_SELECT_TABLE_FILTER, Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { ROLE_TYPES } from '@waldur/permissions/constants';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const InvitationScopeTypeFilter = () => (
  <TableFilterItem title={translate('Scope type')} name="scope_type">
    <Field
      name="scope_type"
      component={(fieldProps) => (
        <Select
          options={ROLE_TYPES}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);
