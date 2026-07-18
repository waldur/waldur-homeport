import { useQuery } from '@tanstack/react-query';
import { FunctionComponent } from 'react';
import { OptionProps, components } from 'react-select';
import { User, rolesList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { ENV } from '@/core/config';
import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { PermissionRequest, Role, RoleType } from '@/permissions/types';
import {
  filterGrantableRoles,
  filterRolesByType,
  formatRoleLabel,
  getAmbiguousRoleDescriptions,
} from '@/permissions/utils';

const renderRoleType = (roleType: RoleType) =>
  ({
    customer: 'O',
    project: 'P',
    service_provider: 'SP',
    call: 'C',
    call_organizer: 'CO',
  })[roleType] || '';

const RoleOption: FunctionComponent<OptionProps<Role>> = (props) => {
  const label = props.data.description || props.data.name;
  // Show the machine name only when another offered role shares this
  // description (a system role and its organization clone both reading
  // "Organization owner"); otherwise it is just noise.
  const ambiguous = getAmbiguousRoleDescriptions(
    (props.options as Role[]) ?? [],
  );
  const showName =
    Boolean(props.data.description) &&
    props.data.description !== props.data.name &&
    ambiguous.has(label);
  return (
    <components.Option {...props}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>
          {label}
          {showName && (
            <span className="text-muted ms-2 small">{props.data.name}</span>
          )}
        </span>
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
};

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
  // When a customer is in scope, the offered roles are that organization's
  // roles (system roles + the org's private clones, minus concealed ones),
  // fetched from the backend. Without a customer we fall back to the global
  // ENV.roles list.
  const customerId = scope?.customerId;
  const { data: scopedRoles } = useQuery({
    queryKey: ['available-roles-for-customer', customerId],
    queryFn: () =>
      getAllPages((page) =>
        rolesList({ query: { available_for_customer: customerId, page } }),
      ),
    enabled: Boolean(customerId),
    staleTime: 5 * 60 * 1000,
  });

  const sourceRoles = customerId ? (scopedRoles ?? []) : ENV.roles;
  // Grantable-roles filter first (drop roles the backend would 403 on), then
  // the explicit allow-list (narrow to a specific subset of role names). Both
  // are optional and compose.
  const typed = filterRolesByType(sourceRoles, types);
  const grantable = user
    ? filterGrantableRoles(typed, user, scope ?? {})
    : typed;
  const options = roleNames
    ? grantable.filter((role) => roleNames.includes(role.name))
    : grantable;
  const ambiguousDescriptions = getAmbiguousRoleDescriptions(options);
  return (
    <SelectGroup
      name="role"
      options={options}
      // Normally just the short description; the machine name is appended only
      // when another offered role shares that description (RoleOption renders
      // the same disambiguation inline in the dropdown).
      getOptionLabel={(role: Role) =>
        formatRoleLabel(role, ambiguousDescriptions)
      }
      getOptionValue={({ name }) => name}
      validate={required}
      components={{ Option: RoleOption }}
      label={translate('Role')}
    />
  );
};
