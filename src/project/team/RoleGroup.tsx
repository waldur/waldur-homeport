import { FunctionComponent } from 'react';
import { OptionProps, components } from 'react-select';
import { User } from 'waldur-js-client';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { PermissionRequest, Role, RoleType } from '@/permissions/types';
import { getGrantableRoles, getRoles } from '@/permissions/utils';

const renderRoleType = (roleType: RoleType) =>
  ({
    customer: 'O',
    project: 'P',
    service_provider: 'SP',
    call: 'C',
    call_organizer: 'CO',
  })[roleType] || '';

const RoleOption: FunctionComponent<OptionProps<Role>> = (props) => (
  <components.Option {...props}>
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      {props.data.description || props.data.name}
      <span
        style={{
          alignSelf: 'center',
          marginLeft: 'auto',
        }}
      >
        {renderRoleType(props.data.content_type)}
      </span>
    </div>
  </components.Option>
);

export const RoleGroup: FunctionComponent<{
  types: RoleType[];
  /** When provided, restrict the offered roles to exactly these role names
   *  (a subset of `types`) rather than every active role of those types. */
  roleNames?: string[];
  /** When provided, only roles this user can actually grant in the given scope
   *  are offered (so the UI never presents a role the backend would 403 on). */
  user?: Pick<User, 'is_staff' | 'permissions'>;
  scope?: Pick<
    PermissionRequest,
    'customerId' | 'projectId' | 'callOrganizerId' | 'scopeId'
  >;
}> = ({ types, roleNames, user, scope }) => {
  // Grantable-roles filter first (drop roles the backend would 403 on), then
  // the explicit allow-list (narrow to a specific subset of role names). Both
  // are optional and compose.
  const grantable = user
    ? getGrantableRoles(types, user, scope ?? {})
    : getRoles(types);
  const options = roleNames
    ? grantable.filter((role) => roleNames.includes(role.name))
    : grantable;
  return (
    <SelectGroup
      name="role"
      options={options}
      getOptionLabel={(role: Role) => role.description || role.name}
      getOptionValue={({ name }) => name}
      validate={required}
      components={{ Option: RoleOption }}
      label={translate('Role')}
    />
  );
};
