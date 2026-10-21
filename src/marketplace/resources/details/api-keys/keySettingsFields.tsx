import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';
import {
  PatchedResourceApiKeyUpdateRequest,
  Resource,
  ResourceApiKeyStatus,
  User,
  usersList,
} from 'waldur-js-client';

import { FormGroup } from '@/form';
import { createLoadOptions } from '@/form/select';
import { SelectMultiBooleanGroup } from '@/form/SelectMultiBooleanGroup';
import { translate } from '@/i18n';
import { SpendingLimitFields } from '@/marketplace/common/SpendingLimitFields';
import { SpendingLimitFormValues } from '@/marketplace/common/spendingLimits';

import {
  formatKeySpendingLimits,
  getKeyLimitComponents,
  KeyLimitComponent,
} from './keySpendingLimits';
import { KeyComponent } from './types';

export const ModelsField: FC<{
  name: string;
  label: string;
  options: string[];
  description?: string;
  space?: number;
  disabled?: boolean;
}> = ({ name, label, options, description, space, disabled }) => (
  <FormGroup label={label} description={description} space={space}>
    <Field
      name={name}
      component={SelectMultiBooleanGroup}
      options={options}
      checkboxes
      disabled={disabled}
    />
  </FormGroup>
);

const KeyLimitsField: FC<{
  label: string;
  components: KeyLimitComponent[];
  description?: string;
  space?: number;
  disabled?: boolean;
}> = ({ label, components, description, space, disabled }) => (
  <FormGroup label={label} description={description} space={space}>
    <SpendingLimitFields
      components={components}
      name="spending_limits"
      disabled={disabled}
      positive
    />
  </FormGroup>
);

export type AssigneeOption = Pick<User, 'uuid' | 'full_name'> &
  Partial<Pick<User, 'email'>>;

// The assignee picker shared by the request and edit dialogs. It lists the
// resource's project members, the only users the backend accepts.
export const useAssigneeField = (resource: Resource) =>
  useMemo(
    () => ({
      name: 'user',
      label: translate('Assignee'),
      type: 'async_select',
      loadOptions: createLoadOptions(usersList, 'full_name', {
        project_uuid: resource.project_uuid,
        field: ['full_name', 'email', 'uuid'],
        o: ['full_name'],
      }),
      // A key's current assignee comes without an email.
      getOptionLabel: ({ full_name, email }: AssigneeOption) =>
        email ? `${full_name} (${email})` : full_name,
      getOptionValue: ({ uuid }: AssigneeOption) => uuid,
      isClearable: true,
      help_text: translate(
        'Only the assignee can reveal the key. Leave empty for a key shared by the project.',
      ),
      space: 5,
    }),
    [resource.project_uuid],
  );

interface KeySettingsFieldsOptions {
  // The key's own limits: one set before the provider or the resource moved
  // stays valid, so the form still saves without the user touching it.
  currentLimits?: ResourceApiKeyStatus['spending_limits'];
  // Shown but locked when only the assignee may change.
  disabledReason?: string;
}

/** The components the key dialogs show limit fields for, with the key's maximum per period. */
export const getKeyLimitFieldComponents = (
  resource: Resource,
  components: KeyComponent[],
  currentLimits?: ResourceApiKeyStatus['spending_limits'],
) => getKeyLimitComponents(components, resource.spending_limits, currentLimits);

// Limits and models shared by the request and edit dialogs; empty inherits the resource's.
export const getKeySettingsFields = (
  resource: Resource,
  components: KeyComponent[],
  models: string[],
  { currentLimits, disabledReason }: KeySettingsFieldsOptions = {},
) => {
  const locked = {
    disabled: Boolean(disabledReason),
    disabled_tooltip: disabledReason,
  };
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
                "Each limit pauses this key alone once reached, and may not exceed the resource's limit for the same period. Clear a field to remove that limit.",
              ),
            },
            space: 5,
            ...locked,
          },
        ]
      : []),
    ...(models.length
      ? [
          {
            name: 'allowed_models',
            component: ModelsField,
            extraProps: {
              label: translate('Models'),
              options: models,
              description: translate(
                'Leave all unticked to allow every model.',
              ),
            },
            space: 5,
            ...locked,
          },
        ]
      : []),
  ];
};

export interface KeySettingsFormValues {
  spending_limits?: SpendingLimitFormValues;
  allowed_models?: string[];
}

// Only the settings the dialog shows are sent, and limits always in full: a
// cleared limit or an empty model list is how the user removes one, so leaving
// the field out would keep the old value instead. The backend stores empty as
// null, which for models means every model. So an edit sends models only when
// the user touched them: a key limited to models the offering has since
// retired shows none ticked, and saving an unrelated change would otherwise
// open it to every model.
export const serializeKeySettings = (
  values: KeySettingsFormValues,
  limitComponents: KeyLimitComponent[],
  models: string[],
  modelsTouched = true,
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
  ...(models.length && modelsTouched
    ? { allowed_models: values.allowed_models ?? [] }
    : {}),
});
