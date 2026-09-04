import { CaretDownIcon } from '@phosphor-icons/react';
import * as RadixPopover from '@radix-ui/react-popover';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldRenderProps } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { Tip } from '@/core/Tooltip';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { PopoverMenuContent } from '@/navigation/NavMenu';
import { Role } from '@/permissions/types';
import { getAmbiguousRoleDescriptions } from '@/permissions/utils';
import { Customer } from '@/workspace/types';

// Role title with the machine name appended only when another offered role
// shares this description (a system role and its identically-named
// organization clone); otherwise the name is just noise.
const RoleTitle: React.FC<{ role: Role; ambiguous: Set<string> }> = ({
  role,
  ambiguous,
}) => (
  <span className="menu-title">
    {role.description || role.name}
    {role.description &&
      role.description !== role.name &&
      ambiguous.has(role.description) && (
        <span className="text-muted ms-2 small">{role.name}</span>
      )}
  </span>
);

interface RoleAndProjectSelectPopupProps {
  roles: (Role & { tooltip? })[];
  customer: Customer;
  currentProject: Pick<Project, 'uuid'>;
  selectedRole: Role;
  selectedProject;
  select;
  /** Closes the enclosing Popover — see RoleAndProjectSelect's own
   * controlled `open` state. Not every selection closes it: picking a
   * role that still needs a project reveals the project sub-panel
   * instead (see onClickRole below). */
  close(): void;
}

const RoleAndProjectSelectPopup: React.FC<RoleAndProjectSelectPopupProps> = ({
  roles,
  customer,
  currentProject,
  selectedRole,
  selectedProject,
  select,
  close,
}) => {
  const refSearch = useRef<HTMLInputElement>();

  const onClickRole = useCallback(
    (role: Role) => {
      if (role.uuid !== selectedRole?.uuid) {
        select(
          role,
          selectedProject || currentProject || customer?.projects?.[0],
        );

        if (currentProject) {
          close();
        }
      }
      if (role.content_type !== 'project') {
        select(role, null);
        close();
      } else {
        if (refSearch?.current) refSearch.current.focus();
      }
    },
    [select, selectedRole, selectedProject, currentProject, customer, close],
  );

  const onClickProject = useCallback(
    (project: Pick<Project, 'uuid' | 'url'>) => {
      if (project.uuid !== selectedProject?.uuid) {
        select(selectedRole, project);
      }
      close();
    },
    [select, selectedProject, selectedRole, close],
  );

  const ambiguous = useMemo(() => getAmbiguousRoleDescriptions(roles), [roles]);

  const [query, setQuery] = useState('');
  const projects = useMemo(() => {
    if (!customer?.projects_count) return [];
    const q = query.toLowerCase();
    return (customer.projects || []).filter((project) =>
      project.name.toLowerCase().includes(q),
    );
  }, [customer, query]);

  const showProjects = selectedRole?.content_type === 'project';
  const hasProject = Boolean(customer?.projects_count || currentProject);

  return (
    <div className="d-flex">
      <div className="w-200px mw-250px">
        {roles.map((role) =>
          hasProject || !showProjects ? (
            <div key={role.uuid} className="menu-item">
              {role.is_active ? (
                <span
                  className={
                    'menu-link' +
                    (selectedRole?.uuid === role.uuid ? ' active' : '')
                  }
                  onClick={() => onClickRole(role)}
                  aria-hidden="true"
                >
                  <RoleTitle role={role} ambiguous={ambiguous} />
                  {role.content_type === 'project' && !currentProject && (
                    <span className="menu-arrow" />
                  )}
                </span>
              ) : (
                <Tip
                  id={'tip-project-role-' + role.name}
                  label={role.tooltip}
                  className="menu-link disabled px-3"
                >
                  <RoleTitle role={role} ambiguous={ambiguous} />
                </Tip>
              )}
            </div>
          ) : (
            <div key={role.uuid} className="menu-item px-3">
              <span className="menu-link disabled px-3">
                <RoleTitle role={role} ambiguous={ambiguous} />
                <span className="menu-arrow" />
              </span>
            </div>
          ),
        )}
      </div>
      {showProjects && !currentProject && (
        <div className="sub-select d-flex flex-column mw-300px mh-300px">
          <div className="w-100 px-2 border-bottom">
            <input
              ref={refSearch}
              type="text"
              className="form-control form-control-flush"
              name="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={translate('Search for project')}
              autoComplete="off"
            />
          </div>

          <div className="scroll-y">
            {projects.map((project) => (
              <div key={project.uuid} className="menu-item">
                <span
                  className={
                    'menu-link' +
                    (selectedProject?.uuid === project.uuid ? ' active' : '')
                  }
                  onClick={() => onClickProject(project)}
                  aria-hidden="true"
                >
                  <span className="menu-title">{project.name}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface RoleAndProjectSelectFieldProps {
  name: string;
  roles: Role[];
  customer: Customer;
  currentProject: Project;
  placeholder?: string;
  disabled?: boolean;
}
interface RoleAndProjectSelectProps
  extends
    Omit<RoleAndProjectSelectFieldProps, 'name'>,
    FieldRenderProps<any, HTMLElement> {}

const RoleAndProjectSelect: React.FC<RoleAndProjectSelectProps> = (props) => {
  const { roles, customer, currentProject, placeholder } = props;

  const selectedRole = props.input.value?.role;
  const selectedProject = props.input.value?.project;

  const [open, setOpen] = useState(false);

  return (
    <div className="role-project-select">
      <RadixPopover.Root open={open} onOpenChange={setOpen} modal={false}>
        <RadixPopover.Trigger asChild>
          <FormGroup className="position-relative w-100 rotate">
            <FormControl
              type="text"
              value={[
                selectedRole?.description || selectedRole?.name,
                selectedProject?.name,
              ]
                .filter(Boolean)
                .join(' - ')}
              placeholder={placeholder}
              readOnly
              className="pe-12"
            />

            <span className="svg-icon svg-icon-1 rotate-toggle-180 position-absolute mx-4 end-0 h-100 d-flex align-items-center">
              <CaretDownIcon weight="bold" />
            </span>
          </FormGroup>
        </RadixPopover.Trigger>
        <PopoverMenuContent
          placement="bottom-start"
          className="role-project-select-popup menu-gray-700 menu-state-bg-light menu-state-primary border fw-bold fs-6 py-1"
        >
          <RoleAndProjectSelectPopup
            roles={roles}
            customer={customer}
            currentProject={currentProject}
            selectedRole={selectedRole}
            selectedProject={selectedProject}
            select={(role: Role, project) => {
              props.input.onChange({
                role,
                project,
              });
            }}
            close={() => setOpen(false)}
          />
        </PopoverMenuContent>
      </RadixPopover.Root>
    </div>
  );
};

export const RoleAndProjectSelectField: React.FC<
  RoleAndProjectSelectFieldProps
> = ({ name, roles, customer, currentProject, disabled }) => {
  return !disabled ? (
    <Field
      name={name}
      validate={required}
      render={(fieldProps) => (
        <RoleAndProjectSelect
          {...fieldProps}
          roles={roles}
          customer={customer}
          currentProject={currentProject}
          placeholder={translate('Select...')}
        />
      )}
    />
  ) : (
    <Field
      name={name}
      validate={required}
      render={({ input, meta }) => (
        <FormControl
          {...input}
          placeholder={translate('Select...')}
          disabled={disabled}
          isInvalid={meta.touched && meta.invalid}
        />
      )}
    />
  );
};
