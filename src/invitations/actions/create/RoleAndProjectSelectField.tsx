import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useCombobox } from 'downshift';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { FieldRenderProps } from 'react-final-form';
import { Project } from 'waldur-js-client';

import { cn, Tooltip, useMenuItemClassName, MenuPopover } from 'waldur-ui';

import { required } from '@/core/validators';
import { FilterBox } from '@/form/FilterBox';
import { translate } from '@/i18n';
import { Role } from '@/permissions/types';
import { getRoleQualifier, getRoleQualifiers } from '@/permissions/utils';
import { Customer } from '@/workspace/types';

// The picker's own highlight, as before the menu migration: a hovered,
// keyboard-highlighted or selected row is brand-coloured on gray-100
// (Metronic's menu-state-bg-light + menu-state-title-primary).
const ROLE_HIGHLIGHT_CLASSNAME =
  'menu-row-active:bg-[var(--menu-item-light-bg)] menu-row-active:text-[var(--menu-item-brand-text)]';

// A role or project row's wrapper, for end-to-end tests.
const OPTION_HOOKS = { 'data-testid': 'role-project-select-option' };

const PROJECT_ITEM_CLASSNAME = cn(
  'flex items-center no-underline select-none transition-colors duration-200',
  'group-data-[density=compact]/menu:px-[9.75px] group-data-[density=compact]/menu:py-[8px]',
  'group-data-[density=base]/menu:px-[12px] group-data-[density=base]/menu:py-[8px]',
  'px-[12px] py-[8px] leading-[inherit]',
  'text-[var(--menu-item-strong-text)] cursor-pointer',
  'hover:bg-[var(--menu-item-light-bg)] hover:text-[var(--menu-item-brand-text)]',
  'aria-selected:bg-[var(--menu-item-light-bg)] aria-selected:text-[var(--menu-item-brand-text)]',
  '[&.active]:bg-[var(--menu-item-light-bg)] [&.active]:text-[var(--menu-item-brand-text)]',
  'aria-disabled:cursor-not-allowed aria-disabled:text-[var(--menu-item-disabled-text)]',
  'focus-visible:outline-offset-[calc(var(--focus-ring-width)*-1)] hover:focus-visible:outline-none',
);

const RowArrow = () => (
  <CaretRightIcon
    size={14}
    weight="bold"
    aria-hidden="true"
    className="ms-[8px] shrink-0 text-[var(--surface-text-muted)]"
  />
);

const RoleTitle: React.FC<{
  role: Role;
  qualifiers: Map<string, string>;
}> = ({ role, qualifiers }) => {
  const qualifier = getRoleQualifier(role, qualifiers);
  return (
    <span className="flex grow items-center">
      {role.description || role.name}
      {qualifier && <span className="text-muted ms-2 small">{qualifier}</span>}
    </span>
  );
};

interface ProjectComboboxProps {
  projects: Pick<Project, 'name' | 'uuid' | 'url'>[];
  selectedProject?: Pick<Project, 'name' | 'uuid' | 'url'>;
  onClickProject: (project: Pick<Project, 'name' | 'uuid' | 'url'>) => void;
  onSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  searchRef?: React.RefObject<HTMLInputElement>;
}

const ProjectCombobox: React.FC<ProjectComboboxProps> = ({
  projects,
  selectedProject,
  onClickProject,
  onSearchKeyDown,
  searchRef,
}) => {
  const [query, setQuery] = useState('');
  const filteredProjects = useMemo(() => {
    const search = query.trim().toLowerCase();
    return projects.filter((project) =>
      project.name.toLowerCase().includes(search),
    );
  }, [projects, query]);

  const selectedProjectIndex = useMemo(() => {
    return filteredProjects.findIndex((p) => p.uuid === selectedProject?.uuid);
  }, [filteredProjects, selectedProject?.uuid]);

  const { getInputProps, getMenuProps, getItemProps, highlightedIndex } =
    useCombobox({
      items: filteredProjects,
      itemToString: (project) => project?.name || '',
      isOpen: true,
      initialHighlightedIndex:
        selectedProjectIndex !== -1 ? selectedProjectIndex : 0,
      defaultHighlightedIndex: 0,
      getA11yStatusMessage: () => '',
      onSelectedItemChange: ({ selectedItem }) => {
        if (selectedItem) {
          onClickProject(selectedItem);
        }
      },
      stateReducer: (state, actionAndChanges) => {
        const { type, changes } = actionAndChanges;
        switch (type) {
          case useCombobox.stateChangeTypes.InputKeyDownArrowUp:
            if (state.highlightedIndex === 0) {
              return { ...changes, highlightedIndex: 0 };
            }
            return changes;
          case useCombobox.stateChangeTypes.InputKeyDownArrowDown:
            if (state.highlightedIndex === filteredProjects.length - 1) {
              return {
                ...changes,
                highlightedIndex: filteredProjects.length - 1,
              };
            }
            return changes;
          case useCombobox.stateChangeTypes.InputKeyDownEnter:
          case useCombobox.stateChangeTypes.ItemClick:
            return {
              ...changes,
              inputValue: state.inputValue,
            };
          case useCombobox.stateChangeTypes.InputKeyDownEscape:
            return {
              ...changes,
              isOpen: true,
            };
          default:
            return changes;
        }
      },
    });

  return (
    <div className="sub-select d-flex flex-column mw-300px mh-300px">
      <div className="w-100 px-2 border-bottom">
        <FilterBox
          {...getInputProps({
            ref: searchRef,
            type: 'search',
            'aria-label': translate('Search for project'),
            autoComplete: 'off',
            spellCheck: false,
            placeholder: translate('Search for project'),
            value: query,
            onChange: (event: any) => setQuery(event.target.value),
            onKeyDown: onSearchKeyDown,
            preventEnterSubmit: false,
            autoFocus: true,
            className: 'form-control-flush',
            inputClassName: 'border-0 shadow-none',
          })}
        />
      </div>

      <div
        {...getMenuProps({
          'aria-label': translate('Projects'),
          className: 'scroll-y',
        })}
      >
        {filteredProjects.length === 0 && (
          <div className="text-center text-muted p-2">
            {translate('No projects found.')}
          </div>
        )}
        {filteredProjects.map((project, index) => (
          <div
            key={project.uuid}
            {...getItemProps({
              item: project,
              index,
              onPointerDown: (e: any) => e.preventDefault(),
            })}
            className={cn(
              PROJECT_ITEM_CLASSNAME,
              selectedProject?.uuid === project.uuid && 'active',
              highlightedIndex === index && 'active',
            )}
            {...OPTION_HOOKS}
          >
            {project.name}
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const rowClassName = useMenuItemClassName();
  const searchRef = useRef<HTMLInputElement>(null);

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
        searchRef.current?.focus();
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

  const qualifiers = useMemo(() => getRoleQualifiers(roles), [roles]);

  const showProjects = selectedRole?.content_type === 'project';
  const hasProject = Boolean(customer?.projects_count || currentProject);

  const isRoleSelectable = useCallback(
    (role: Role) =>
      role.is_active && (hasProject || role.content_type !== 'project'),
    [hasProject],
  );

  // Role rows are buttons, so they reset the button background with
  // bg-[transparent]: Bootstrap's bg-transparent is !important and hid the
  // row highlight (hover, the selected role).
  const roleButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const onRoleKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number, role: Role) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        for (let i = index + 1; i < roles.length; i++) {
          if (isRoleSelectable(roles[i]) && roleButtonsRef.current[i]) {
            roleButtonsRef.current[i]?.focus();
            return;
          }
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        for (let i = index - 1; i >= 0; i--) {
          if (isRoleSelectable(roles[i]) && roleButtonsRef.current[i]) {
            roleButtonsRef.current[i]?.focus();
            return;
          }
        }
      } else if (event.key === 'Home') {
        event.preventDefault();
        const first = roles.findIndex(isRoleSelectable);
        if (first !== -1) roleButtonsRef.current[first]?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        for (let i = roles.length - 1; i >= 0; i--) {
          if (isRoleSelectable(roles[i]) && roleButtonsRef.current[i]) {
            roleButtonsRef.current[i]?.focus();
            return;
          }
        }
      } else if (
        event.key === 'ArrowRight' &&
        role.content_type === 'project' &&
        !currentProject
      ) {
        event.preventDefault();
        onClickRole(role);
      }
    },
    [roles, isRoleSelectable, currentProject, onClickRole],
  );

  const onSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        event.key === 'ArrowLeft' &&
        (!event.currentTarget.value || event.currentTarget.selectionStart === 0)
      ) {
        event.preventDefault();
        const activeIndex = roles.findIndex(
          (r) => r.uuid === selectedRole?.uuid,
        );
        if (activeIndex !== -1 && roleButtonsRef.current[activeIndex]) {
          roleButtonsRef.current[activeIndex]?.focus();
        } else {
          roleButtonsRef.current[0]?.focus();
        }
      }
    },
    [roles, selectedRole],
  );

  return (
    <div className="d-flex">
      <div
        className="w-200px mw-250px"
        role="listbox"
        aria-label={translate('Roles')}
      >
        {roles.length === 0 && (
          <p className="text-center text-muted mb-0 px-3 py-2">
            {translate('No roles available.')}
          </p>
        )}
        {roles.map((role, index) =>
          hasProject || !showProjects ? (
            <div key={role.uuid} {...OPTION_HOOKS}>
              {role.is_active ? (
                <button
                  ref={(el) => {
                    roleButtonsRef.current[index] = el;
                  }}
                  type="button"
                  role="option"
                  className={cn(
                    rowClassName,
                    ROLE_HIGHLIGHT_CLASSNAME,
                    'w-100 text-start border-0 bg-[transparent]',
                    selectedRole?.uuid === role.uuid && 'active',
                  )}
                  onClick={() => onClickRole(role)}
                  onKeyDown={(e) => onRoleKeyDown(e, index, role)}
                  aria-selected={selectedRole?.uuid === role.uuid}
                >
                  <RoleTitle role={role} qualifiers={qualifiers} />
                  {role.content_type === 'project' && !currentProject && (
                    <RowArrow />
                  )}
                </button>
              ) : (
                <Tooltip label={role.tooltip}>
                  <button
                    type="button"
                    role="option"
                    disabled
                    aria-disabled="true"
                    aria-selected={false}
                    className={cn(
                      rowClassName,
                      'w-100 text-start border-0 bg-[transparent] px-[9.75px]',
                    )}
                    data-disabled=""
                  >
                    <RoleTitle role={role} qualifiers={qualifiers} />
                  </button>
                </Tooltip>
              )}
            </div>
          ) : (
            <div key={role.uuid} {...OPTION_HOOKS} className="px-[9.75px]">
              <button
                type="button"
                role="option"
                disabled
                aria-disabled="true"
                aria-selected={false}
                className={cn(
                  rowClassName,
                  'w-100 text-start border-0 bg-[transparent] px-[9.75px]',
                )}
                data-disabled=""
              >
                <RoleTitle role={role} qualifiers={qualifiers} />
                <RowArrow />
              </button>
            </div>
          ),
        )}
      </div>
      {showProjects && !currentProject && (
        <ProjectCombobox
          key={selectedRole?.uuid}
          projects={customer?.projects || []}
          selectedProject={selectedProject}
          onClickProject={onClickProject}
          onSearchKeyDown={onSearchKeyDown}
          searchRef={searchRef}
        />
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
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const onTriggerKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    }
  }, []);

  return (
    <div className="role-project-select">
      <MenuPopover open={open} onOpenChange={setOpen} modal={false}>
        <MenuPopover.Trigger asChild>
          <FormGroup
            className="group position-relative w-100 cursor-pointer"
            data-testid="role-project-select"
          >
            <FormControl
              ref={inputRef}
              type="text"
              role="combobox"
              aria-haspopup="dialog"
              aria-expanded={open}
              aria-controls="role-project-select-popup"
              value={[
                selectedRole?.description || selectedRole?.name,
                selectedProject?.name,
              ]
                .filter(Boolean)
                .join(' - ')}
              placeholder={placeholder}
              readOnly
              className="pe-12 cursor-pointer"
              onKeyDown={onTriggerKeyDown}
            />

            {/* Pinned over the input's right edge (top-0: the group is a
                block, so without it the caret would sit below the input).
                Flips while the popup is open: the Radix trigger marks that
                with data-state, not a class. */}
            <span className="svg-icon svg-icon-1 position-absolute top-0 mx-4 end-0 h-100 d-flex align-items-center transition-[rotate] duration-300 group-data-[state=open]:rotate-180 pointer-events-none">
              <CaretDownIcon weight="bold" />
            </span>
          </FormGroup>
        </MenuPopover.Trigger>
        <MenuPopover.Content
          ref={popupRef}
          id="role-project-select-popup"
          align="start"
          // Opened from the invite dialog, so it must sit above the modal.
          className="z-picker-popover border fw-bold fs-6 py-1"
          data-testid="role-project-select-popup"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            const selectedBtn =
              popupRef.current?.querySelector<HTMLButtonElement>(
                '[role="option"][aria-selected="true"]',
              );
            if (selectedBtn) {
              selectedBtn.focus();
            } else {
              const firstBtn =
                popupRef.current?.querySelector<HTMLButtonElement>(
                  '[role="option"]:not([disabled])',
                );
              firstBtn?.focus();
            }
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
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
        </MenuPopover.Content>
      </MenuPopover>
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
