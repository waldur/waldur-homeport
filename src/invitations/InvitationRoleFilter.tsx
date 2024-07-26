import { Field } from 'redux-form';

import {
  AsyncPaginate,
  REACT_SELECT_TABLE_FILTER,
} from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { roleAutocomplete } from './api';

export const InvitationRoleFilter = () => (
  <TableFilterItem
    title={translate('Role')}
    name="role"
    badgeValue={(value) => value?.description || value?.name}
  >
    <Field
      name="role"
      component={(fieldProps) => (
        <AsyncPaginate
          placeholder={translate('Select role...')}
          loadOptions={roleAutocomplete}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.description || option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          {...REACT_SELECT_TABLE_FILTER}
        />
      )}
    />
  </TableFilterItem>
);
