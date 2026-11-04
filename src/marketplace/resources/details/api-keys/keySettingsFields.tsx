import { FC, useMemo } from 'react';
import { Field, useField } from 'react-final-form';
import {
  PatchedResourceApiKeyUpdateRequest,
  Resource,
  ResourceApiKeyStatus,
  User,
  usersList,
} from 'waldur-js-client';

import type { Space } from 'waldur-form';
import { Checkbox } from 'waldur-ui';

import { FormGroup } from '@/form';
import { FieldWarning } from '@/form/FieldWarning';
import { AsyncSelectLoader, createLoadOptions } from '@/form/select';
import { SelectMultiBooleanGroup } from '@/form/SelectMultiBooleanGroup';
import { translate } from '@/i18n';
import { ALL_MODELS } from '@/marketplace/common/modelSelection';
import { SpendingLimitFields } from '@/marketplace/common/SpendingLimitFields';
import { SpendingLimitFormValues } from '@/marketplace/common/spendingLimits';

import {
  formatKeySpendingLimits,
  getKeyLimitComponents,
  KeyLimitComponent,
} from './keySpendingLimits';
import { KeyComponent } from './types';

// The All models tick is a form value of its own, so the individual ticks
// keep their state while it locks them and decide again once it is cleared.
const ALL_MODELS_FIELD = 'all_models';

export const ModelsField: FC<{
  name: string;
  label: string;
  options: string[];
  space?: Space;
  disabled?: boolean;
}> = ({ name, label, options, space, disabled }) => {
  const allModels = useField<boolean>(ALL_MODELS_FIELD).input;
  const selected = useField<string[]>(name, { subscription: { value: true } })
    .input.value;
  const everyModel = Boolean(allModels.value);
  return (
    <FormGroup label={label} space={space}>
      <div className="flex flex-col gap-2">
        <Checkbox
          label={translate('All models')}
          checked={everyModel}
          disabled={disabled}
          onCheckedChange={(checked: boolean) => allModels.onChange(checked)}
        />
        <Field
          name={name}
          component={SelectMultiBooleanGroup}
          options={options}
          checkboxes
          disabled={disabled || everyModel}
        />
      </div>
      {/* Not an error: a key with no models is a valid thing to ask for. */}
      {(!options.length || (!everyModel && !selected?.length)) && (
        <FieldWarning
          error={translate('The key will not be able to call any model.')}
        />
      )}
    </FormGroup>
  );
};

const KeyLimitsField: FC<{
  label: string;
  components: KeyLimitComponent[];
  description?: string;
  space?: Space;
  disabled?: boolean;
}> = ({ label, components, description, space, disabled }) => (
  <FormGroup label={label} description={description} space={space}>
    <SpendingLimitFields
      components={components}
      name="spending_limits"
      disabled={disabled}
      positive
      keepHeld
    />
  </FormGroup>
);

export type AssigneeOption = Pick<User, 'uuid' | 'full_name'> &
  Partial<Pick<User, 'email'>>;

// A key requested with no assignee is shared by the project. The picker
// offers that as a choice of its own -- selected to start with and first in
// the list -- because an empty field whose meaning was only in its help text
// went unread: people picked a member who already held a key, and a person
// holds at most one key per resource.
export const PROJECT_KEY_OPTION: AssigneeOption = { uuid: '', full_name: '' };

const PROJECT_KEY_LABEL = () =>
  translate('Project key (shared by the project)');

/** The ``user`` a key is requested for: a member's uuid, or null for a project key. */
export const assigneeUuid = (option?: AssigneeOption | null): string | null =>
  option && option.uuid !== PROJECT_KEY_OPTION.uuid ? option.uuid : null;

// Not every account has an email.
export const getAssigneeLabel = (option: AssigneeOption): string =>
  option.uuid === PROJECT_KEY_OPTION.uuid
    ? PROJECT_KEY_LABEL()
    : option.email
      ? `${option.full_name} (${option.email})`
      : option.full_name;

/**
 * Puts the project key at the top of the members' first page. Not on later
 * pages, where it would repeat, nor in search results, which are for finding
 * a member.
 */
export const withProjectKeyOption =
  (
    loadMembers: AsyncSelectLoader<AssigneeOption>,
  ): AsyncSelectLoader<AssigneeOption> =>
  async (query, prevOptions, additional) => {
    const page = await loadMembers(query, prevOptions, additional);
    return query || prevOptions?.length
      ? page
      : { ...page, options: [PROJECT_KEY_OPTION, ...page.options] };
  };

// The request dialog's assignee picker: a key's assignee is chosen only when
// it is requested. It lists the resource's project members, the only users
// the backend accepts, below the project key.
export const useAssigneeField = (resource: Resource) =>
  useMemo(
    () => ({
      name: 'user',
      label: translate('Assignee'),
      type: 'async_select',
      loadOptions: withProjectKeyOption(
        createLoadOptions(usersList, 'full_name', {
          project_uuid: resource.project_uuid,
          field: ['full_name', 'email', 'uuid'],
          o: ['full_name'],
        }),
      ),
      getOptionLabel: getAssigneeLabel,
      getOptionValue: ({ uuid }: AssigneeOption) => uuid,
      isClearable: true,
      // Clearing the field asks for a project key too, so the empty field
      // says so rather than "Select...".
      extraProps: { placeholder: PROJECT_KEY_LABEL() },
      help_text: translate(
        'Any member of the project can reveal a project key. Pick a person for a personal key that only they can reveal; a person can hold one key per resource.',
      ),
      space: 4,
    }),
    [resource.project_uuid],
  );

interface KeySettingsFieldsOptions {
  // The key's own limits: one set before the provider or the resource moved
  // stays valid, so the form still saves without the user touching it.
  currentLimits?: ResourceApiKeyStatus['spending_limits'];
}

/** The components the key dialogs show limit fields for, with the key's maximum per period. */
export const getKeyLimitFieldComponents = (
  resource: Resource,
  components: KeyComponent[],
  currentLimits?: ResourceApiKeyStatus['spending_limits'],
) => getKeyLimitComponents(components, resource.spending_limits, currentLimits);

// Limits and models shared by the request and edit dialogs. An empty limit
// inherits the resource's; no model ticked means no model. ``models`` are the
// ones the resource allows (getResourceModels), null when the offering lists
// none, and then there is no Models field.
export const getKeySettingsFields = (
  resource: Resource,
  components: KeyComponent[],
  models: string[] | null,
  { currentLimits }: KeySettingsFieldsOptions = {},
) => {
  const limitComponents = getKeyLimitFieldComponents(
    resource,
    components,
    currentLimits,
  );
  return [
    ...(limitComponents.length
      ? [
          {
            name: 'spending_limits',
            component: KeyLimitsField,
            extraProps: {
              label: translate('Limits'),
              components: limitComponents,
              description: translate(
                "Each limit pauses this key alone once reached, and may not exceed the resource's limit for the same or a longer period. Clear a field to remove that limit.",
              ),
            },
            space: 4,
          },
        ]
      : []),
    ...(models
      ? [
          {
            name: 'allowed_models',
            component: ModelsField,
            extraProps: {
              label: translate('Models'),
              options: models,
            },
            space: 4,
          },
        ]
      : []),
  ];
};

export interface KeySettingsFormValues {
  spending_limits?: SpendingLimitFormValues;
  all_models?: boolean;
  // The individual ticks; they count only while all_models is off.
  allowed_models?: string[];
  // The key's models the dialog does not show, because the offering retired
  // them or the resource no longer allows them. The key keeps its list as
  // chosen, so they go back with the ticks.
  kept_models?: string[];
}

// Only the settings the dialog shows are sent, and always in full: a cleared
// limit is how the user removes one, so leaving the field out would keep the
// old value instead. Models are sent as the form shows them: every model as
// its own value, and the ticks otherwise, with the key's models the dialog
// does not show. No tick is an empty list, which the backend stores as no
// model, so a key limited to models it can no longer call, which shows none
// ticked, is never widened.
export const serializeKeySettings = (
  values: KeySettingsFormValues,
  limitComponents: KeyLimitComponent[],
  models: string[] | null,
): Pick<
  PatchedResourceApiKeyUpdateRequest,
  'spending_limits' | 'allowed_models'
> => ({
  ...(limitComponents.length
    ? {
        spending_limits: formatKeySpendingLimits(
          values.spending_limits,
          limitComponents,
        ),
      }
    : {}),
  ...(models
    ? {
        allowed_models: values.all_models
          ? [ALL_MODELS]
          : [...(values.allowed_models ?? []), ...(values.kept_models ?? [])],
      }
    : {}),
});
