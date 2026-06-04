import { FC } from 'react';

import { translate } from '@/i18n';
import { getProjectRoles } from '@/permissions/utils';
import { SelectFilter } from '@/table';

export const ProjectRoleFilter: FC<any> = (props) => (
  <SelectFilter
    name="project_role"
    title={translate('Project role')}
    placeholder={translate('Select project roles')}
    options={getProjectRoles()}
    getOptionLabel={(role) => role.description || role.name}
    getOptionValue={({ name }) => name}
    isClearable={true}
    isMulti
    {...props}
  />
);
