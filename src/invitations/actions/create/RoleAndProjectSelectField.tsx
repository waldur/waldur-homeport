import React, { useCallback, useMemo } from 'react';
import { Field } from 'react-final-form';
import { FieldRenderProps } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { Select } from 'waldur-ui';

import { composeValidators, required } from '@/core/validators';
import { translate } from '@/i18n';
import { Role } from '@/permissions/types';
import { getRoleQualifier, getRoleQualifiers } from '@/permissions/utils';
import { Customer } from '@/workspace/types';

type RoleOption = Role & { tooltip?: string };
type ProjectOption = Pick<Project, 'name' | 'uuid' | 'url'>;

interface RoleAndProjectSelectFieldProps {
  name: string;
  roles: Role[];
  customer: Customer;
  currentProject: Project;
  placeholder?: string;
  disabled?: boolean;
  /** Accessible names of the two selects; rows of a list should say which
   * row they belong to. */
  roleLabel?: string;
  projectLabel?: string;
}
interface RoleAndProjectSelectProps
  extends
    Omit<RoleAndProjectSelectFieldProps, 'name'>,
    FieldRenderProps<any, HTMLElement> {}

const RoleAndProjectSelect: React.FC<RoleAndProjectSelectProps> = (props) => {
  const {
    roles,
    customer,
    currentProject,
    placeholder,
    disabled,
    roleLabel = translate('Role'),
    projectLabel = translate('Project'),
    input,
    meta,
  } = props;

  const selectedRole: RoleOption = input.value?.role ?? null;
  const selectedProject: ProjectOption = input.value?.project ?? null;

  const qualifiers = useMemo(() => getRoleQualifiers(roles), [roles]);
  const hasProject = Boolean(customer?.projects_count || currentProject);

  const isRoleDisabled = useCallback(
    (role: RoleOption) =>
      !role.is_active || (role.content_type === 'project' && !hasProject),
    [hasProject],
  );

  // The reason a role is unavailable is part of its label, so it is shown in
  // the menu and announced by screen readers rather than hidden in a tooltip.
  const getDisabledReason = useCallback(
    (role: RoleOption) =>
      isRoleDisabled(role)
        ? role.tooltip ||
          (hasProject ? undefined : translate('There are no projects.'))
        : undefined,
    [isRoleDisabled, hasProject],
  );

  const getRoleTitle = useCallback(
    (role: RoleOption) => {
      const title = role.description || role.name;
      const qualifier = getRoleQualifier(role, qualifiers);
      return qualifier ? `${title} (${qualifier})` : title;
    },
    [qualifiers],
  );

  const getRoleLabel = useCallback(
    (role: RoleOption) => {
      const reason = getDisabledReason(role);
      return reason ? `${getRoleTitle(role)}. ${reason}` : getRoleTitle(role);
    },
    [getRoleTitle, getDisabledReason],
  );

  const formatRoleLabel = useCallback(
    (role: RoleOption, { context }: { context: 'menu' | 'value' }) => {
      const reason = context === 'menu' && getDisabledReason(role);
      return (
        <>
          {getRoleTitle(role)}
          {reason && (
            <div className="text-xs text-[var(--surface-text-muted)]">
              {reason}
            </div>
          )}
        </>
      );
    },
    [getRoleTitle, getDisabledReason],
  );

  const onRoleChange = (role: RoleOption) => {
    if (role.content_type !== 'project') {
      input.onChange({ role, project: null });
      return;
    }
    input.onChange({
      role,
      project: currentProject || selectedProject || customer?.projects?.[0],
    });
  };

  const showProjects =
    selectedRole?.content_type === 'project' && !currentProject;

  // The field error belongs to whichever select is still empty.
  const roleMeta = selectedRole ? undefined : meta;
  const projectMeta = selectedRole ? meta : undefined;

  return (
    <div className="flex flex-col gap-2" data-testid="role-project-select">
      <Select
        aria-label={roleLabel}
        placeholder={placeholder}
        options={roles}
        value={selectedRole}
        onChange={onRoleChange}
        getOptionValue={(role: RoleOption) => role.uuid}
        getOptionLabel={getRoleLabel}
        formatOptionLabel={formatRoleLabel}
        isOptionDisabled={isRoleDisabled}
        noOptionsMessage={() => translate('No roles available.')}
        onBlur={() => input.onBlur()}
        // react-select blurs after every pick on touch devices; keep focus
        // so Tab moves on from the picked select on every device.
        blurInputOnSelect={false}
        isDisabled={disabled}
        meta={roleMeta}
      />
      {showProjects && (
        <Select
          aria-label={projectLabel}
          placeholder={translate('Search for project')}
          options={customer?.projects || []}
          value={selectedProject}
          onChange={(project: ProjectOption) =>
            input.onChange({ role: selectedRole, project })
          }
          getOptionValue={(project: ProjectOption) => project.uuid}
          getOptionLabel={(project: ProjectOption) => project.name}
          noOptionsMessage={() => translate('No projects found.')}
          onBlur={() => input.onBlur()}
          blurInputOnSelect={false}
          isDisabled={disabled}
          meta={projectMeta}
        />
      )}
    </div>
  );
};

// A project-level role is incomplete without the project it applies to.
const projectRequired = (value) =>
  value?.role?.content_type === 'project' && !value.project
    ? translate('Select a project.')
    : undefined;

const validate = composeValidators(required, projectRequired);

export const RoleAndProjectSelectField: React.FC<
  RoleAndProjectSelectFieldProps
> = ({ name, ...props }) => (
  <Field
    name={name}
    validate={validate}
    render={(fieldProps) => (
      <RoleAndProjectSelect
        {...fieldProps}
        {...props}
        placeholder={translate('Select...')}
      />
    )}
  />
);
