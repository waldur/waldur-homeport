import { FC, useMemo } from 'react';
import { Field, useField } from 'react-final-form';
import {
  PatchedResourceApiKeyUpdateRequest,
  Resource,
  User,
  usersList,
} from 'waldur-js-client';

import { Checkbox } from 'waldur-ui';

import { FormGroup } from '@/form';
import { FieldWarning } from '@/form/FieldWarning';
import { createLoadOptions } from '@/form/select';
import { SelectMultiBooleanGroup } from '@/form/SelectMultiBooleanGroup';
import { translate } from '@/i18n';
import { ALL_MODELS } from '@/marketplace/common/modelSelection';

import { componentLabel } from './keyLimits';
import { KeyComponent } from './types';

// The All models tick is a form value of its own, so the individual ticks
// keep their state while it locks them and decide again once it is cleared.
const ALL_MODELS_FIELD = 'all_models';

export const ModelsField: FC<{
  name: string;
  label: string;
  options: string[];
  space?: number;
  disabled?: boolean;
}> = ({ name, label, options, space, disabled }) => {
  const allModels = useField<boolean>(ALL_MODELS_FIELD).input;
  const selected = useField<string[]>(name, { subscription: { value: true } })
    .input.value;
  const everyModel = Boolean(allModels.value);
  return (
    <FormGroup label={label} space={space}>
      <div className="flex flex-col gap-8px">
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

// Limits and models shared by the request and edit dialogs. An empty limit
// inherits the resource's; no model ticked means no model. ``models`` are the
// ones the resource allows (getResourceModels), null when the offering lists
// none, and then there is no Models field.
export const getKeySettingsFields = (
  resource: Resource,
  components: KeyComponent[],
  models: string[] | null,
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
    ...(models
      ? [
          {
            name: 'allowed_models',
            component: ModelsField,
            extraProps: {
              label: translate('Models'),
              options: models,
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
  components: KeyComponent[],
  models: string[] | null,
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
  ...(models
    ? {
        allowed_models: values.all_models
          ? [ALL_MODELS]
          : [...(values.allowed_models ?? []), ...(values.kept_models ?? [])],
      }
    : {}),
});
