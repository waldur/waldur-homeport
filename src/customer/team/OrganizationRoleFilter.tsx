import { FC } from 'react';

import { translate } from '@/i18n';
import { getCustomerRoles } from '@/permissions/utils';
import { SelectFilter } from '@/table';

export const OrganizationRoleFilter: FC<any> = (props) => (
  <SelectFilter
    name="organization_role"
    title={translate('Organization role')}
    placeholder={translate('Select organization roles')}
    options={getCustomerRoles()}
    getOptionLabel={(role) => role.description || role.name}
    getOptionValue={({ name }) => name}
    isClearable={true}
    isMulti
    {...props}
  />
);
