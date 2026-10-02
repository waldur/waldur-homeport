import { FC, useMemo } from 'react';
import { Field } from 'react-final-form';
import {
  PatchedResourceApiKeyUpdateRequest,
  Resource,
  User,
  usersList,
} from 'waldur-js-client';

import { FormGroup } from '@/form';
import { createLoadOptions } from '@/form/select';
import { SelectMultiBooleanGroup } from '@/form/SelectMultiBooleanGroup';
import { translate } from '@/i18n';

import { componentLabel } from './keyLimits';
import { KeyComponent } from './types';

const ModelsField: FC<{
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
  // The key's own limits: one set before the resource limit was lowered below
  // it stays valid, so the form still saves without the user touching it.
  currentLimits?: Record<string, number> | null;
  // Shown but locked when only the assignee may change.
  disabledReason?: string;
}

// Limits and models shared by the request and edit dialogs; empty inherits the resource's.
export const getKeySettingsFields = (
  resource: Resource,
  components: KeyComponent[],
  models: string[],
  { currentLimits, disabledReason }: KeySettingsFieldsOptions = {},
) => {
  const limits = (resource.limits ?? {}) as Record<string, number>;
  const locked = {
    disabled: Boolean(disabledReason),
    disabled_tooltip: disabledReason,
  };
  return [
    ...components.map((component) => {
      // Zero means "no limit", so it must not become the field's maximum.
      const resourceLimit = limits[component.type] || undefined;
      const currentLimit = currentLimits?.[component.type] || undefined;
      return {
        name: `limits.${component.type}`,
        label: componentLabel(component),
        type: 'integer',
        unit: component.measured_unit,
        minValue: 0,
        maxValue:
          resourceLimit && currentLimit
            ? Math.max(resourceLimit, currentLimit)
            : resourceLimit,
        help_text: resourceLimit
          ? translate('Resource limit: {value}', { value: resourceLimit })
          : undefined,
        space: 5,
        ...locked,
      };
    }),
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
  limits?: Record<string, number | string | null>;
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
  components: KeyComponent[],
  models: string[],
  modelsTouched = true,
): Pick<PatchedResourceApiKeyUpdateRequest, 'limits' | 'allowed_models'> => ({
  ...(components.length
    ? {
        limits: Object.fromEntries(
          components
            .map(({ type }) => [type, values.limits?.[type]] as const)
            .filter(([, value]) => value !== undefined && value !== null)
            .filter(([, value]) => value !== '')
            .map(([type, value]) => [type, Number(value)]),
        ),
      }
    : {}),
  ...(models.length && modelsTouched
    ? { allowed_models: values.allowed_models ?? [] }
    : {}),
});
