import { Plus, Trash } from '@phosphor-icons/react';
import arrayMutators from 'final-form-arrays';
import React, { FunctionComponent, useEffect, useMemo, useState } from 'react';
import { Field, Form, useForm, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import {
  personalAccessTokensAvailableBindingTargetsList,
  personalAccessTokensAvailableScopesList,
  personalAccessTokensCreate,
  PersonalAccessTokenCreateRequest,
} from 'waldur-js-client';

import { PermissionOptions } from '@/administration/roles/PermissionOptions';
import { lazyComponent } from '@/core/lazyComponent';
import { required } from '@/core/validators';
import { DateField } from '@/form/DateField';
import { SelectField } from '@/form/select/SelectField';
import { StringField } from '@/form/StringField';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { FormGroup } from '@/marketplace/offerings/FormGroup';
import { useModal } from '@/modal/actions';
import { ModalDialog } from '@/modal/ModalDialog';
import { useNotify } from '@/store/notify';

import { labelForType } from './entityFetchers';
import { EntityScopePicker } from './EntityScopePicker';

const PersonalAccessTokenSecretDialog = lazyComponent(() =>
  import('./PersonalAccessTokenSecretDialog').then((module) => ({
    default: module.PersonalAccessTokenSecretDialog,
  })),
);

interface PersonalAccessTokenCreateDialogProps {
  resolve: {
    refetch?: () => void;
  };
}

// Scopes that are inherently global and cannot be combined with entity bindings.
// Keep in sync with the backend serializer's exclusivity check.
const GLOBAL_SCOPES = new Set(['STAFF.ACCESS', 'SUPPORT.ACCESS']);

/**
 * Effect-only child: when the user toggles a global scope on, drop any
 * bindings they already added — submitting both would 400 from the backend.
 * Lives inside <Form> so it can use the final-form hooks; renders nothing.
 */
const ClearBindingsOnGlobalScope: FunctionComponent = () => {
  const form = useForm();
  const { values } = useFormState<FormValues>({
    subscription: { values: true },
  });
  const hasGlobalScope = (values.scopes ?? []).some((s) =>
    GLOBAL_SCOPES.has(s),
  );
  const bindingsLength = (values.allowed_scopes ?? []).length;
  useEffect(() => {
    if (hasGlobalScope && bindingsLength > 0) {
      form.change('allowed_scopes', []);
    }
  }, [hasGlobalScope, bindingsLength, form]);
  return null;
};

interface BindingRow {
  type: string | null;
  // The full entity object kept around for displaying the chosen item; only
  // the uuid is sent to the API.
  entity: { uuid: string; name: string } | null;
}

interface FormValues {
  name: string;
  scopes: string[];
  expires_at: string;
  allowed_scopes: BindingRow[];
}

export const PersonalAccessTokenCreateDialog: React.FC<
  PersonalAccessTokenCreateDialogProps
> = ({ resolve: { refetch } }) => {
  const { showErrorResponse } = useNotify();
  const { openDialog, closeDialog } = useModal();

  const [availableScopes, setAvailableScopes] = useState<Set<string>>();
  // permission -> Set of TYPE_MAP keys the user can bind that permission to
  const [bindingTargets, setBindingTargets] =
    useState<Record<string, Set<string>>>();

  useEffect(() => {
    personalAccessTokensAvailableScopesList().then((res) => {
      setAvailableScopes(new Set((res.data as any[]).map((s) => s.permission)));
    });
    personalAccessTokensAvailableBindingTargetsList().then((res) => {
      const map: Record<string, Set<string>> = {};
      for (const row of res.data as any[]) {
        map[row.permission] = new Set(row.types);
      }
      setBindingTargets(map);
    });
  }, []);

  const scopeOptions = useMemo(() => {
    if (!availableScopes) return [];
    const result: { value: string; label: string }[] = [];
    for (const group of PermissionOptions) {
      for (const opt of group.options) {
        if (availableScopes.has(opt.value)) {
          result.push({
            value: opt.value,
            label: `${group.label}: ${opt.label}`,
          });
        }
      }
    }
    return result;
  }, [availableScopes]);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const processRequest = React.useCallback(
    async (values: FormValues) => {
      const payload: PersonalAccessTokenCreateRequest = {
        name: values.name,
        scopes: values.scopes,
        expires_at: values.expires_at,
        allowed_scopes: (values.allowed_scopes ?? [])
          .filter((b) => b.type && b.entity?.uuid)
          .map((b) => ({ type: b.type as string, uuid: b.entity!.uuid })),
      };
      try {
        const response = await personalAccessTokensCreate({ body: payload });
        const created = response.data;
        if (refetch) {
          await refetch();
        }
        closeDialog();
        openDialog(PersonalAccessTokenSecretDialog, {
          size: 'lg',
          resolve: { token: created.token, tokenName: created.name },
        });
      } catch (e) {
        showErrorResponse(e, translate('Unable to create token.'));
      }
    },
    [showErrorResponse, openDialog, closeDialog, refetch],
  );

  return (
    <Form<FormValues>
      onSubmit={processRequest}
      mutators={{ ...arrayMutators }}
      initialValues={{
        name: '',
        scopes: [],
        expires_at: '',
        allowed_scopes: [],
      }}
      render={({ handleSubmit, submitting, invalid, values }) => {
        const selectedScopes = values.scopes ?? [];
        const hasGlobalScope = selectedScopes.some((s) => GLOBAL_SCOPES.has(s));
        // Union of bindable types across all currently selected permissions.
        const allowedTypes = new Set<string>();
        if (bindingTargets) {
          for (const scope of selectedScopes) {
            const types = bindingTargets[scope];
            if (types) for (const t of types) allowedTypes.add(t);
          }
        }
        const typeOptions = Array.from(allowedTypes)
          .sort()
          .map((t) => ({ value: t, label: labelForType(t) }));

        return (
          <form onSubmit={handleSubmit}>
            <ClearBindingsOnGlobalScope />
            <ModalDialog
              title={translate('Create personal access token')}
              footer={
                <SubmitButton
                  disabled={invalid}
                  submitting={submitting}
                  label={translate('Create token')}
                  className="btn btn-primary"
                />
              }
            >
              <div className="size-lg">
                <FormGroup label={translate('Token name')} required>
                  <Field
                    component={StringField}
                    name="name"
                    validate={required}
                    placeholder={translate('e.g. CI/CD pipeline token')}
                  />
                </FormGroup>
                <FormGroup
                  label={translate('Permissions')}
                  required
                  description={translate(
                    'Select the permissions this token should have. The token can only use permissions you currently hold.',
                  )}
                >
                  <Field
                    component={SelectField}
                    name="scopes"
                    validate={required}
                    isMulti
                    simpleValue
                    options={scopeOptions}
                    placeholder={translate('Select permissions...')}
                  />
                </FormGroup>

                <FormGroup
                  label={translate('Restrict to specific entities')}
                  description={
                    hasGlobalScope
                      ? translate(
                          'STAFF.ACCESS and SUPPORT.ACCESS are global — they cannot be combined with entity bindings.',
                        )
                      : translate(
                          'Optional. Limit the token to actions on the listed organizations / projects / calls / etc. Empty list = unrestricted within the permissions above.',
                        )
                  }
                >
                  <FieldArray name="allowed_scopes">
                    {({ fields }) => (
                      <>
                        {fields.map((name, index) => {
                          const row = (values.allowed_scopes ?? [])[index] as
                            | BindingRow
                            | undefined;
                          return (
                            <div
                              key={name}
                              className="d-flex align-items-start gap-2 mb-2"
                            >
                              <div style={{ flex: '0 0 220px' }}>
                                <Field
                                  name={`${name}.type`}
                                  component={SelectField}
                                  simpleValue
                                  options={typeOptions}
                                  placeholder={translate('Type')}
                                  isDisabled={
                                    hasGlobalScope || typeOptions.length === 0
                                  }
                                />
                              </div>
                              <div className="flex-grow-1">
                                <Field name={`${name}.entity`}>
                                  {({ input }) => (
                                    <EntityScopePicker
                                      type={row?.type ?? null}
                                      value={input.value || null}
                                      onChange={input.onChange}
                                      isDisabled={hasGlobalScope}
                                    />
                                  )}
                                </Field>
                              </div>
                              <button
                                type="button"
                                className="btn btn-icon btn-text-danger"
                                onClick={() => fields.remove(index)}
                                disabled={hasGlobalScope}
                                title={translate('Remove')}
                              >
                                <Trash />
                              </button>
                            </div>
                          );
                        })}
                        <button
                          type="button"
                          className="btn btn-light btn-sm"
                          onClick={() =>
                            fields.push({ type: null, entity: null })
                          }
                          disabled={hasGlobalScope || typeOptions.length === 0}
                          title={
                            typeOptions.length === 0
                              ? translate(
                                  'Select at least one permission above to enable bindings.',
                                )
                              : undefined
                          }
                        >
                          <Plus className="me-1" />
                          {translate('Add binding')}
                        </button>
                      </>
                    )}
                  </FieldArray>
                </FormGroup>

                <FormGroup
                  label={translate('Expiration date')}
                  required
                  description={translate(
                    'The token will stop working after this date.',
                  )}
                >
                  <Field
                    component={DateField}
                    name="expires_at"
                    validate={required}
                    minDate={minDate}
                    placeholder={translate('Select expiration date')}
                  />
                </FormGroup>
              </div>
            </ModalDialog>
          </form>
        );
      }}
    />
  );
};
