import { TagIcon } from '@phosphor-icons/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FC, useEffect, useMemo, useRef } from 'react';
import { useField, useForm, useFormState } from 'react-final-form';
import {
  RoleDetails,
  RoleDetailsFieldEnum,
  rolesList,
  rolesUpdateDescriptionsUpdate,
} from 'waldur-js-client';

import { Badge, BaseButton } from 'waldur-ui';

import { getAllPages } from '@/core/api';
import { ENV } from '@/core/config';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { required } from '@/core/validators';
import { FormGroup, SelectGroup, StringGroup } from '@/form';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { formatRoleType } from '@/permissions/utils';
import { ProgressStep, Wizard, WizardModal, WizardStepProps } from '@/wizard';

import { getRoles } from './utils';

const CUSTOM = 'custom';

interface FormValues {
  scope: string;
  preset: string;
  names: Record<string, string>;
  // The preset each scope's names were last filled in from, so going back to
  // the first step, or to a scope visited before, keeps edited names.
  filledFrom?: Record<string, string>;
}

interface Preset {
  value: string;
  label: () => string;
  description: () => string;
  names: Record<string, string>;
}

/**
 * Ready-made role names, by role scope. The names are stored data in the
 * default language, not UI strings, so they are not passed through
 * translate(). A role a preset does not name keeps its current name.
 */
const PRESETS: Record<string, Preset[]> = {
  proposal: [
    {
      value: 'proposal',
      label: () => translate('Calls for proposals'),
      description: () =>
        translate('For deployments that run calls for proposals.'),
      names: {
        'PROPOSAL.MANAGER': 'Proposal manager',
        'PROPOSAL.ADMIN': 'Proposal administrator',
        'PROPOSAL.MEMBER': 'Proposal member',
      },
    },
    {
      value: 'marketplace',
      label: () => translate('Marketplace only'),
      description: () =>
        translate(
          'For marketplace-only mode, where applicants request access to an offering instead of submitting a proposal to a call.',
        ),
      names: {
        'PROPOSAL.MANAGER': 'Lead applicant',
        'PROPOSAL.ADMIN': 'Co-applicant',
        'PROPOSAL.MEMBER': 'Team member',
      },
    },
  ],
};

const getPresets = (scope: string): Preset[] => PRESETS[scope] ?? [];

const getPreset = (scope: string, value: string) =>
  getPresets(scope).find((preset) => preset.value === value);

const getNameField = () => `description_${ENV.defaultLanguage || 'en'}`;

interface WizardData {
  roles: RoleDetails[];
  current: Record<string, string>;
}

// Roles a preset names come first, in the preset's order (most to least
// access); the rest follow by code.
const presetRank = (scope: string, roleName: string) => {
  const index = Object.keys(getPresets(scope)[0]?.names ?? {}).indexOf(
    roleName,
  );
  return index === -1 ? Infinity : index;
};

const rolesInScope = (roles: RoleDetails[], scope: string) =>
  roles
    .filter((role) => role.content_type === scope)
    .sort(
      (a, b) =>
        presetRank(scope, a.name) - presetRank(scope, b.name) ||
        a.name.localeCompare(b.name),
    );

/**
 * The preset whose names the scope's roles carry now, else custom. A preset
 * that names none of the scope's roles matches nothing.
 */
const matchingPreset = (data: WizardData, scope: string) =>
  getPresets(scope).find((preset) => {
    const named = rolesInScope(data.roles, scope).filter(
      (role) => preset.names[role.name],
    );
    return (
      named.length > 0 &&
      named.every((role) => preset.names[role.name] === data.current[role.uuid])
    );
  })?.value ?? CUSTOM;

const notBlank = (value?: string) => required(value?.trim());

const ScopeStep: FC<WizardStepProps> = (props) => {
  const data: WizardData = props.data;
  // Untyped: the names are changed by nested path (names.<uuid>).
  const form = useForm();
  const { values } = useFormState<FormValues>({
    subscription: { values: true },
  });
  const previousScope = useRef(values.scope);

  // One pass decides the preset and fills the names, so a scope change never
  // fills them from the previous scope's preset. A scope visited before
  // returns to its own preset and keeps the names edited there.
  useEffect(() => {
    const filledFrom = values.filledFrom ?? {};
    let preset = values.preset;
    if (values.scope !== previousScope.current) {
      previousScope.current = values.scope;
      preset = filledFrom[values.scope] ?? matchingPreset(data, values.scope);
      if (preset !== values.preset) {
        form.change('preset', preset);
      }
    }
    if (filledFrom[values.scope] === preset) {
      return;
    }
    const chosen = getPreset(values.scope, preset);
    form.batch(() => {
      rolesInScope(data.roles, values.scope).forEach((role) =>
        form.change(
          `names.${role.uuid}`,
          chosen?.names[role.name] ?? data.current[role.uuid],
        ),
      );
      form.change('filledFrom', { ...filledFrom, [values.scope]: preset });
    });
  }, [values.scope, values.preset, values.filledFrom, data, form]);

  const scopes = useMemo(
    () =>
      [...new Set(data.roles.map((role) => role.content_type))]
        .map((scope) => ({ value: scope, label: formatRoleType(scope) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [data.roles],
  );
  const presetOptions = [
    ...getPresets(values.scope).map(({ value, label }) => ({
      value,
      label: label(),
    })),
    { value: CUSTOM, label: translate('Custom names') },
  ];
  const preset = getPreset(values.scope, values.preset);

  return (
    <WizardModal {...props}>
      <p className="text-muted">
        {translate(
          'Choose which roles to rename, then select a preset to fill in their names. You can adjust individual names in the next step.',
        )}
      </p>
      <SelectGroup
        name="scope"
        label={translate('Scope')}
        options={scopes}
        simpleValue
        isClearable={false}
      />
      {getPresets(values.scope).length > 0 ? (
        <SelectGroup
          name="preset"
          label={translate('Preset')}
          options={presetOptions}
          simpleValue
          isClearable={false}
          description={
            preset
              ? preset.description()
              : translate('Keep the current names and edit them yourself.')
          }
        />
      ) : (
        // Said rather than hidden, like other empty choices: the scope keeps
        // its current names, which the next step lets you edit.
        <FormGroup label={translate('Preset')}>
          <p className="text-muted mb-0">
            {translate(
              'No presets are available for this scope. You can edit the names yourself in the next step.',
            )}
          </p>
        </FormGroup>
      )}
    </WizardModal>
  );
};

/**
 * One role's name, with the chosen preset's name beside it and whether the
 * name differs from the one the role has now.
 */
const RoleNameField = ({
  role,
  current,
  preset,
  disabled,
}: {
  role: RoleDetails;
  current: string;
  preset?: string;
  disabled: boolean;
}) => {
  // Untyped: the name is changed by nested path (names.<uuid>).
  const form = useForm();
  const field = `names.${role.uuid}`;
  const {
    input: { value },
  } = useField<string>(field, { subscription: { value: true } });
  const changed = (value ?? '') !== current;

  return (
    <StringGroup
      name={field}
      label={role.name}
      disabled={disabled}
      required
      validate={notBlank}
      quickAction={
        preset ? (
          <span className="small text-muted d-flex align-items-center gap-2">
            {translate('Preset: {name}', { name: preset })}
            {value !== preset && (
              <BaseButton
                label={translate('Apply preset')}
                variant="tertiary-ghost"
                size="sm"
                onClick={() => form.change(field, preset)}
              />
            )}
          </span>
        ) : undefined
      }
      description={
        changed ? (
          <span className="d-flex align-items-center gap-2">
            <Badge variant="warning" shape="pill" tone="light">
              {translate('New name')}
            </Badge>
            {current
              ? translate('Current: {name}', { name: current })
              : translate('Current: no name')}
          </span>
        ) : (
          <Badge variant="neutral" shape="pill" tone="light">
            {translate('Unchanged')}
          </Badge>
        )
      }
    />
  );
};

const NamesStep: FC<WizardStepProps> = (props) => {
  const data: WizardData = props.data;
  const { scope, preset } = props.values as FormValues;
  const chosen = getPreset(scope, preset);

  return (
    <WizardModal {...props}>
      <p className="text-muted">
        {translate(
          'Only the default-language name is changed; edit other languages with "Edit name translations".',
        )}
      </p>
      {rolesInScope(data.roles, scope).map((role) => (
        <RoleNameField
          key={role.uuid}
          role={role}
          current={data.current[role.uuid]}
          preset={chosen?.names[role.name]}
          disabled={props.submitting}
        />
      ))}
    </WizardModal>
  );
};

const steps: ProgressStep[] = [
  { key: 'scope', label: translate('Scope and preset'), completed: false },
  { key: 'names', label: translate('Names'), completed: false },
];

const wizardForms = [ScopeStep, NamesStep];

export const RoleNamesAdjustDialog = ({ resolve: { refetch } }) => {
  const { closeDialog } = useModal();
  const queryClient = useQueryClient();
  const nameField = getNameField();

  // The default-language name specifically: `description` is resolved for
  // the viewer's language, and saving that would put a translation in its
  // place.
  const {
    data: roles,
    isLoading,
    isError,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ['system-role-names', nameField],
    queryFn: () =>
      getAllPages((page) =>
        rolesList({
          query: {
            page,
            is_system_role: true,
            field: [
              'uuid',
              'name',
              'content_type',
              nameField as RoleDetailsFieldEnum,
            ],
          },
        }),
      ).then((all: RoleDetails[]) =>
        all.sort((a, b) => a.name.localeCompare(b.name)),
      ),
    meta: { skipGlobalErrorRedirect: true },
    // A background refetch would reinitialize the form and drop edits; the
    // save invalidates this query instead.
    refetchOnWindowFocus: false,
  });

  const data = useMemo<WizardData>(
    () => ({
      roles: roles ?? [],
      current: Object.fromEntries(
        (roles ?? []).map((role) => [role.uuid, role[nameField] ?? '']),
      ),
    }),
    [roles, nameField],
  );

  const initialValues = useMemo<FormValues>(() => {
    // Open on a scope that has presets, since that is what this is for.
    const scope =
      Object.keys(PRESETS).find((key) =>
        data.roles.some((role) => role.content_type === key),
      ) ??
      data.roles[0]?.content_type ??
      '';
    return { scope, preset: matchingPreset(data, scope), names: {} };
  }, [data]);

  // Everything that caches role names, refreshed after any save attempt:
  // ENV.roles for labels and pickers, this wizard, "Edit name translations"
  // and the role form, the organization and offering role pickers, and the
  // role hygiene report.
  const refreshRoleNames = async () => {
    try {
      ENV.roles = await getRoles();
    } catch {
      // Stale labels until the next page load; the names were still saved.
    }
    await Promise.all(
      [
        'system-role-names',
        'role-details',
        'available-roles-for-customer',
        'offering-scope-roles',
        'RoleHygieneReport',
      ].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    );
    refetch();
  };

  const saveMutation = useManagedMutation<void, Error, FormValues>({
    mutationFn: async (values) => {
      // Only the names that changed, so an untouched role logs no event.
      // Every role is tried, so one failure does not hide which ones saved.
      const failed: string[] = [];
      for (const role of rolesInScope(data.roles, values.scope)) {
        const name = (values.names[role.uuid] ?? '').trim();
        if (name === data.current[role.uuid]) {
          continue;
        }
        try {
          await rolesUpdateDescriptionsUpdate({
            path: { uuid: role.uuid },
            body: { [nameField]: name },
          });
        } catch {
          failed.push(role.name);
        }
      }
      await refreshRoleNames();
      if (failed.length) {
        throw new Error(
          translate('Unable to rename: {roles}.', { roles: failed.join(', ') }),
        );
      }
    },
    successMessage: translate('Role names have been updated.'),
    errorMessage: translate('Some role names were not updated.'),
    // The names that did save are already refreshed; reopen to retry the rest.
    onError: () => closeDialog(),
  });

  const title = translate('Adjust names');

  if (isLoading) {
    return (
      <ModalDialog title={title}>
        <LoadingSpinner />
      </ModalDialog>
    );
  }

  if (isError) {
    return (
      <ModalDialog title={title}>
        <LoadingErred
          loadData={refetchRoles}
          message={translate('Unable to load roles.')}
        />
      </ModalDialog>
    );
  }

  return (
    <Wizard<FormValues>
      title={title}
      steps={steps}
      wizardForms={wizardForms}
      onSubmit={(values) => saveMutation.mutateAsync(values).catch(() => {})}
      initialValues={initialValues}
      submitLabel={translate('Save')}
      data={data}
      modalProps={{ iconNode: <TagIcon weight="bold" /> }}
    />
  );
};
