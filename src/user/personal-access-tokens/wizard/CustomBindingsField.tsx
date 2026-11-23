import { Plus, Trash } from '@phosphor-icons/react';
import { FunctionComponent } from 'react';
import { Field, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';

import { BaseButton, FormText } from 'waldur-ui';

import { FormGroup } from '@/form';
import { SelectField } from '@/form/select/SelectField';
import { translate } from '@/i18n';

import { labelForType } from '../entityFetchers';
import { EntityScopePicker } from '../EntityScopePicker';

import type { BindingRow, TokenWizardValues } from './tokenPayload';

interface CustomBindingsFieldProps {
  /** Entity types the user can bind at least one of their permissions to. */
  types: readonly string[];
  /** The permissions include global access, which takes no restriction. */
  globalScopeSelected?: boolean;
}

/** Free-form entity restrictions of a custom token, one row per entity. */
export const CustomBindingsField: FunctionComponent<
  CustomBindingsFieldProps
> = ({ types, globalScopeSelected }) => {
  const { values, errors } = useFormState<TokenWizardValues>({
    subscription: { values: true, errors: true },
  });
  const typeOptions = [...types]
    .sort()
    .map((t) => ({ value: t, label: labelForType(t) }));

  return (
    <FormGroup
      group
      label={translate('Restrict to specific entities')}
      description={translate(
        'Optional. Limit the token to actions on the listed organizations, projects, calls and so on. Leave empty for a token that is not restricted to any entity; only then can it carry the global staff or support permissions.',
      )}
    >
      <FieldArray name="allowed_scopes">
        {({ fields }) => (
          <>
            {fields.map((name, index) => {
              const row = (values.allowed_scopes ?? [])[index] as
                BindingRow | undefined;
              return (
                <div key={name} className="flex items-start gap-1.5 mb-1.5">
                  <div className="shrink-0 w-55">
                    <Field name={`${name}.type`}>
                      {({ input, meta }) => (
                        <SelectField
                          input={{
                            ...input,
                            // A new type makes the chosen entity meaningless.
                            onChange: (value) =>
                              fields.update(index, {
                                type: value ?? null,
                                entity: null,
                              }),
                          }}
                          meta={meta}
                          simpleValue
                          options={typeOptions}
                          aria-label={`${translate('Type')} ${index + 1}`}
                          placeholder={translate('Type')}
                        />
                      )}
                    </Field>
                  </div>
                  <div className="grow">
                    <Field name={`${name}.entity`}>
                      {({ input }) => (
                        <EntityScopePicker
                          aria-label={`${translate('Entity')} ${index + 1}`}
                          type={row?.type ?? null}
                          value={input.value || null}
                          onChange={input.onChange}
                        />
                      )}
                    </Field>
                  </div>
                  <BaseButton
                    variant="text-danger"
                    onClick={() => fields.remove(index)}
                    tooltip={translate('Remove')}
                    iconNode={<Trash />}
                  />
                </div>
              );
            })}
            <BaseButton
              variant="tertiary"
              size="sm"
              onClick={() => fields.push({ type: null, entity: null })}
              disabled={globalScopeSelected || typeOptions.length === 0}
              disabledReason={
                globalScopeSelected
                  ? translate(
                      'Not available while the token carries global staff or support access.',
                    )
                  : translate(
                      'None of your permissions can be restricted to an entity.',
                    )
              }
              iconNode={<Plus />}
              label={translate('Add binding')}
            />
            {typeof errors?.restrictions === 'string' &&
              (values.allowed_scopes ?? []).some(
                (row) => !row.type || !row.entity?.uuid,
              ) && (
                <FormText variant="danger" as="p" className="mt-1.5">
                  {errors.restrictions}
                </FormText>
              )}
          </>
        )}
      </FieldArray>
    </FormGroup>
  );
};
