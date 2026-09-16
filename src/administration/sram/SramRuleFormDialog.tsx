import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC, useMemo } from 'react';
import { Form, useFormState } from 'react-final-form';
import {
  SramProjectRule,
  sramProjectRulesCreate,
  sramProjectRulesUpdate,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { DirtyStateReporter } from '@/core/DirtyFormContext';
import { required } from '@/core/validators';
import {
  BooleanGroup,
  CreatableSelectGroup,
  SelectGroup,
  StringGroup,
  SubmitButton,
} from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Role } from '@/permissions/types';
import {
  formatRoleLabel,
  getAmbiguousRoleDescriptions,
  getProjectRoles,
} from '@/permissions/utils';

import {
  getProjectFieldOptions,
  getProjectMatchOptions,
  getRuleInitialValues,
  getSourceKindOptions,
  groupPatternsAllowed,
  serializeRule,
  SRAM_PATTERN_PLACEHOLDERS,
  SramRuleFormValues,
  toSubmitErrors,
  validateGroupPatterns,
  validateProjectPattern,
} from './utils';

interface SramRuleFormDialogProps {
  resolve: {
    refetch?: () => void;
    rule?: SramProjectRule;
    isDuplicate?: boolean;
  };
}

interface TagOption {
  label: string;
  value: string;
}

// The tag inputs edit a string list; react-select works with option objects.
const formatTags = (value: string[] | undefined): TagOption[] =>
  (value ?? []).map((item) => ({ label: item, value: item }));

const parseTags = (options: TagOption[] | null): string[] =>
  (options ?? []).map((option) => option.value.trim()).filter(Boolean);

const TagsGroup: FC<{
  name: string;
  label: string;
  placeholder: string;
  description: string;
  validate?: (value, allValues) => string | undefined;
}> = (props) => (
  <CreatableSelectGroup
    {...props}
    isMulti
    isClearable
    options={[]}
    format={formatTags}
    parse={parseTags}
    formatCreateLabel={(input: string) =>
      translate('Add "{value}"', { value: input })
    }
    noOptionsMessage={() => translate('Type a value and press Enter')}
  />
);

const PatternHelp: FC = () => (
  <>
    {translate('Available placeholders:')}{' '}
    {SRAM_PATTERN_PLACEHOLDERS.map((name, index) => (
      <span key={name}>
        {index > 0 && ', '}
        <code>{`{${name}}`}</code>
      </span>
    ))}
    .{' '}
    {translate(
      'Group placeholders are empty for collaborations. The match never leaves the organization of the SRAM group.',
    )}
  </>
);

const GroupPatternsField: FC = () => {
  const { values } = useFormState<SramRuleFormValues>({
    subscription: { values: true },
  });
  const allowed = groupPatternsAllowed(values.source_kind);
  return (
    <TagsGroup
      name="group_short_name_patterns"
      label={translate('Group short names')}
      placeholder={translate('e.g. compute-*')}
      description={
        allowed
          ? translate(
              'Only groups whose short name matches one of these are selected. A trailing * matches by prefix. Leave empty to match any group.',
            )
          : translate(
              'Applies only when the source is "Group" or "Collaboration or group".',
            )
      }
      validate={validateGroupPatterns}
    />
  );
};

export const SramRuleFormDialog: FC<SramRuleFormDialogProps> = ({
  resolve,
}) => {
  const isEdit = Boolean(resolve.rule) && !resolve.isDuplicate;
  const isDuplicate = Boolean(resolve.rule) && Boolean(resolve.isDuplicate);

  // Held in a memo: a new initialValues identity resets what the user typed.
  const initialValues = useMemo(
    () => getRuleInitialValues(resolve.rule, resolve.isDuplicate),
    [resolve.rule, resolve.isDuplicate],
  );

  const roleOptions = useMemo(() => {
    const roles: Pick<Role, 'uuid' | 'name' | 'description'>[] =
      getProjectRoles();
    const held = resolve.rule?.project_role;
    // A deactivated role stays pickable for the rule that already uses it.
    if (held && !roles.some((role) => role.uuid === held)) {
      return [
        ...roles,
        {
          uuid: held,
          name: resolve.rule.project_role_name,
          description: resolve.rule.project_role_description,
        },
      ];
    }
    return roles;
  }, [resolve.rule]);
  const ambiguousRoles = useMemo(
    () => getAmbiguousRoleDescriptions(roleOptions),
    [roleOptions],
  );

  const mutation = useManagedMutation<unknown, unknown, SramRuleFormValues>({
    mutationFn: (values) =>
      isEdit
        ? sramProjectRulesUpdate({
            path: { uuid: resolve.rule.uuid },
            body: serializeRule(values),
          })
        : sramProjectRulesCreate({ body: serializeRule(values) }),
    successMessage: isEdit
      ? translate('SRAM project rule has been updated.')
      : translate('SRAM project rule has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update SRAM project rule.')
      : translate('Unable to create SRAM project rule.'),
    refetch: resolve.refetch,
  });

  const onSubmit = async (values: SramRuleFormValues) => {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      // The toast is raised by useManagedMutation; the submit errors put each
      // message under the field it belongs to.
      return toSubmitErrors(error);
    }
  };

  return (
    <Form<SramRuleFormValues>
      onSubmit={onSubmit}
      initialValues={initialValues}
      render={({ handleSubmit, submitting, invalid, submitError }) => (
        <form onSubmit={handleSubmit}>
          <DirtyStateReporter />
          <ModalDialog
            iconNode={isEdit ? null : <PlusCircleIcon weight="bold" />}
            iconColor="success"
            title={
              isEdit
                ? translate('Edit SRAM project rule')
                : isDuplicate
                  ? translate('Duplicate SRAM project rule')
                  : translate('Add SRAM project rule')
            }
            subtitle={translate(
              'Grants a project role to the members of matching SRAM collaborations and groups, on the projects of their organization that the selector picks.',
            )}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  disabled={invalid || submitting}
                  submitting={submitting}
                  label={isEdit ? translate('Save') : translate('Create')}
                />
              </>
            }
          >
            {submitError && (
              <AlertItem
                variant="error"
                className="mb-5"
                title={translate('Unable to save the rule')}
                body={submitError}
              />
            )}
            <StringGroup
              name="name"
              label={translate('Name')}
              placeholder={translate('e.g. Research workspaces')}
              required
              validate={required}
              maxLength={150}
            />
            <BooleanGroup
              name="is_active"
              label={translate('Active')}
              tooltip={translate(
                'An inactive rule grants nothing and revokes the roles it granted.',
              )}
              tooltipEnd
              alignMiddle
              className="w-100"
            />

            <h6 className="mt-6 mb-4">{translate('Which SRAM groups')}</h6>
            <SelectGroup
              name="source_kind"
              label={translate('Source')}
              options={getSourceKindOptions()}
              simpleValue
              isClearable={false}
              required
              validate={required}
              description={translate(
                'Collaborations, groups within them, or both.',
              )}
            />
            <TagsGroup
              name="labels"
              label={translate('Labels')}
              placeholder={translate('e.g. tag_ufra')}
              description={translate(
                'The collaboration must carry one of these labels; a group is judged by the labels of its collaboration. Leave empty to match any.',
              )}
            />
            <GroupPatternsField />

            <h6 className="mt-6 mb-4">{translate('Which projects')}</h6>
            <div className="row">
              <div className="col-sm-6">
                <SelectGroup
                  name="project_field"
                  label={translate('Project field')}
                  options={getProjectFieldOptions()}
                  simpleValue
                  isClearable={false}
                  required
                  validate={required}
                />
              </div>
              <div className="col-sm-6">
                <SelectGroup
                  name="project_match"
                  label={translate('Match')}
                  options={getProjectMatchOptions()}
                  simpleValue
                  isClearable={false}
                  required
                  validate={required}
                />
              </div>
            </div>
            <StringGroup
              name="project_pattern"
              label={translate('Pattern')}
              placeholder="{co_external_id}_"
              required
              validate={validateProjectPattern}
              description={<PatternHelp />}
            />

            <h6 className="mt-6 mb-4">{translate('What it grants')}</h6>
            <SelectGroup
              name="project_role"
              label={translate('Project role')}
              options={roleOptions}
              getOptionValue={(role: Role) => role.uuid}
              getOptionLabel={(role: Role) =>
                formatRoleLabel(role, ambiguousRoles)
              }
              simpleValue
              isClearable={false}
              required
              validate={required}
              spaceless
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
