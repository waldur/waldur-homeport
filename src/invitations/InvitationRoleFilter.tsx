import { Field } from 'react-final-form';

import { AsyncSelect } from '@/form/select';
import { translate } from '@/i18n';
import { roleAutocomplete } from '@/permissions/utils';
import { TableFilterItem } from '@/table/TableFilterItem';

export const InvitationRoleFilter = () => (
  <TableFilterItem
    title={translate('Role')}
    name="role"
    badgeValue={(value) => value?.description || value?.name}
  >
    <Field
      name="role"
      component={(fieldProps) => (
        <AsyncSelect
          placeholder={translate('Select role...')}
          loadOptions={roleAutocomplete}
          getOptionValue={(option) => option.uuid}
          getOptionLabel={(option) => option.description || option.name}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
          isClearable={true}
          variant="tableFilter"
        />
      )}
    />
  </TableFilterItem>
);
