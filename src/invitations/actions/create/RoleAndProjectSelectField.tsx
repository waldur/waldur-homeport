import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FormControl } from 'react-bootstrap';
import { Field } from 'redux-form';

import { PROJECT_ROLES } from '@waldur/core/constants';
import { required } from '@waldur/core/validators';
import { FormField } from '@waldur/form/types';
import { translate } from '@waldur/i18n';
import { MenuComponent } from '@waldur/metronic/assets/ts/components';
import { Customer, Project } from '@waldur/workspace/types';

const isProjectRole = (role) => PROJECT_ROLES.includes(role?.value);

interface RoleAndProjectSelectPopupProps {
  roles;
  customer: Customer;
  currentProject: Project;
  selectedRole;
  selectedProject;
  select;
}

const RoleAndProjectSelectPopup: React.FC<RoleAndProjectSelectPopupProps> = ({
  roles,
  customer,
  currentProject,
  selectedRole,
  selectedProject,
  select,
}) => {
  const refSearch = useRef<HTMLInputElement>();

  const onClickRole = useCallback(
    (role) => {
      if (role.value !== selectedRole?.value) {
        select(
          role,
          selectedProject || currentProject || customer.projects?.[0],
        );

        if (currentProject) {
          MenuComponent.hideDropdowns(null);
        }
      }
      if (!isProjectRole(role)) {
        select(role, null);
        MenuComponent.hideDropdowns(null);
      } else {
        refSearch?.current && refSearch.current.focus();
      }
    },
    [select, selectedRole, selectedProject, refSearch?.current],
  );

  const onClickProject = useCallback(
    (project: Project) => {
      if (project.uuid !== selectedProject?.uuid) {
        select(selectedRole, project);
      }
      MenuComponent.hideDropdowns(null);
    },
    [select, selectedProject, selectedRole],
  );

  const [query, setQuery] = useState('');
  const projects = useMemo(() => {
    const q = query.toLowerCase();
    return customer.projects.filter((project) =>
      project.name.toLowerCase().includes(q),
    );
  }, [customer, query]);

  const showProjects = selectedRole && isProjectRole(selectedRole);
  const hasProject = Boolean(customer.projects?.length);

  return (
    <div
      className="role-project-select-popup menu menu-sub menu-sub-dropdown menu-rounded menu-gray-600 menu-active-bg-light-primary menu-hover-title-primary border fw-bold rounded-0 fs-6 py-3"
      data-kt-menu="true"
    >
      <div className="d-flex">
        <div className="mw-250px">
          {roles.map((role) =>
            hasProject || !isProjectRole(role) ? (
              <div
                key={role.value}
                className="menu-item px-3"
                data-kt-menu-trigger
              >
                <a
                  className={
                    'menu-link px-3' +
                    (selectedRole?.value === role.value ? ' active' : '')
                  }
                  onClick={() => onClickRole(role)}
                >
                  <span className="menu-title">{role.title}</span>
                  {isProjectRole(role) && !currentProject && (
                    <span className="menu-arrow"></span>
                  )}
                </a>
              </div>
            ) : (
              <div
                key={role.value}
                className="menu-item px-3"
                data-kt-menu-trigger
              >
                <a className="menu-link disabled px-3">
                  <span className="menu-title">{role.title}</span>
                  <span className="menu-arrow"></span>
                </a>
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
                <div
                  key={project.uuid}
                  className="menu-item px-3"
                  data-kt-menu-trigger
                >
                  <a
                    className={
                      'menu-link px-3' +
                      (selectedProject?.uuid === project.uuid ? ' active' : '')
                    }
                    onClick={() => onClickProject(project)}
                  >
                    <span className="menu-title">{project.name}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface RoleAndProjectSelectFieldProps {
  name: string;
  roles: { value; title }[];
  customer: Customer;
  currentProject: Project;
  placeholder?: string;
  disabled?: boolean;
}
interface RoleAndProjectSelectProps
  extends Omit<RoleAndProjectSelectFieldProps, 'name'>,
    FormField {}

export const RoleAndProjectSelect: React.FC<RoleAndProjectSelectProps> = (
  props,
) => {
  const { roles, customer, currentProject, placeholder } = props;

  const selectedRole = useMemo(
    () => roles.find((r) => r.value === props.input.value?.role),
    [roles, props.input.value],
  );
  const selectedProject = props.input.value?.project;

  useEffect(() => {
    MenuComponent.reinitialization();
  }, []);

  return (
    <div className="role-project-select">
      <FormControl
        className="form-control-solid"
        type="text"
        value={[selectedRole?.title, selectedProject?.name]
          .filter(Boolean)
          .join(' - ')}
        placeholder={placeholder}
        readOnly
        data-kt-menu-trigger="click"
        data-kt-menu-attach="parent"
        data-kt-menu-placement="bottom"
      />
      {
        <RoleAndProjectSelectPopup
          roles={roles}
          customer={customer}
          currentProject={currentProject}
          selectedRole={selectedRole}
          selectedProject={selectedProject}
          select={(role, project) => {
            props.input.onChange({
              role: role?.value,
              project: project,
            });
          }}
        />
      }
    </div>
  );
};

export const RoleAndProjectSelectField: React.FC<RoleAndProjectSelectFieldProps> =
  ({ name, roles, customer, currentProject, disabled }) => {
    return !disabled ? (
      <Field
        name={name}
        roles={roles}
        customer={customer}
        currentProject={currentProject}
        component={RoleAndProjectSelect}
        placeholder={translate('Select role')}
        validate={[required]}
      />
    ) : (
      <Field
        name={name}
        component={FormControl}
        placeholder={translate('Select role')}
        disabled={disabled}
        validate={[required]}
      />
    );
  };
