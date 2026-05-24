import { Field } from 'react-final-form';

import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { ROLE_TYPES } from '@/permissions/constants';
import { TableFilterItem } from '@/table/TableFilterItem';

export const InvitationScopeTypeFilter = (props) => (
  <TableFilterItem
    title={translate('Scope type')}
    name="scope_type"
    badgeValue={(value) => value?.label || value?.value}
  >
    <Field
      name="scope_type"
      component={(fieldProps) => (
        <Select
          options={props.options || ROLE_TYPES}
          value={fieldProps.input.value}
          onChange={(item) => fieldProps.input.onChange(item)}
          isClearable={true}
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
);
