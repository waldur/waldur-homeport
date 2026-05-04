import { PlusCircleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Card } from 'react-bootstrap';
import { Field, Form } from 'react-final-form';
import {
  Resource,
  ResourceProject,
  marketplaceResourceProjectsCreate,
  marketplaceResourceProjectsPartialUpdate,
} from 'waldur-js-client';

import { required } from '@/core/validators';
import { FormGroup, SubmitButton } from '@/form';
import { NumberField } from '@/form/NumberField';
import { StringField } from '@/form/StringField';
import { TextField } from '@/form/TextField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { renderFieldOrDash } from '@/table/utils';

type LimitComponent = {
  type: string;
  name?: string;
  measured_unit?: string;
  billing_type?: string;
};

type LimitPolicy = 'none' | 'per_project' | 'aggregate';

interface ResourceProjectFormProps {
  resolve: {
    resourceProject?: ResourceProject;
    resource: Resource;
    offering?: {
      components?: LimitComponent[];
      plugin_options?: Record<string, unknown>;
    };
    siblings?: ResourceProject[];
    refetch(): void;
  };
}

export const ResourceProjectForm: FC<ResourceProjectFormProps> = ({
  resolve,
}) => {
  const isEdit = Boolean(resolve.resourceProject?.uuid);

  const limitComponents = (resolve.offering?.components ?? []).filter(
    (c) => c.billing_type === 'limit',
  );

  const policy = ((resolve.offering?.plugin_options as any)
    ?.resource_projects_limit_policy ?? 'none') as LimitPolicy;
  // When the offering requires limits, every limit-billing component
  // must have a non-empty, non-zero value. Backend mirrors this rule
  // (see ResourceProjectSerializer.validate); the frontend rule is
  // here so users see the failure inline instead of via API error.
  const limitsRequired = Boolean(
    (resolve.offering?.plugin_options as any)
      ?.resource_projects_limits_required,
  );
  const resourceLimits = ((resolve.resource as any)?.limits ?? {}) as Record<
    string,
    number
  >;
  // Sum sibling limits per component, excluding this project on edit.
  const siblingTotals: Record<string, number> = {};
  (resolve.siblings ?? []).forEach((s) => {
    if (resolve.resourceProject && s.uuid === resolve.resourceProject.uuid)
      return;
    Object.entries(s.limits ?? {}).forEach(([k, v]) => {
      if (typeof v === 'number') siblingTotals[k] = (siblingTotals[k] ?? 0) + v;
    });
  });

  const renderLimitHint = (c: LimitComponent) => {
    const cap = resourceLimits[c.type];
    if (cap == null) return null; // No parent cap → no hint.
    const unit = c.measured_unit ? ` ${c.measured_unit}` : '';
    if (policy === 'per_project') {
      return translate('{cap}{unit}', { cap, unit });
    }
    if (policy === 'aggregate') {
      const used = siblingTotals[c.type] ?? 0;
      const remaining = Math.max(cap - used, 0);
      return translate('{remaining} of {cap}{unit}', {
        remaining,
        cap,
        unit,
      });
    }
    return null;
  };

  type FormValues = {
    name: string;
    description?: string;
    limits?: Record<string, number | string | null>;
  };

  const initialLimits: Record<string, number> = {};
  limitComponents.forEach((c) => {
    const existing = resolve.resourceProject?.limits?.[c.type];
    if (typeof existing === 'number') initialLimits[c.type] = existing;
  });

  const mutation = useManagedMutation<any, FormValues, any>({
    mutationFn: (values) => {
      const limitsPayload: Record<string, number> = {};
      limitComponents.forEach((c) => {
        const raw = values.limits?.[c.type];
        if (raw === undefined || raw === null || raw === '') return;
        const n = Number(raw);
        if (!Number.isNaN(n)) limitsPayload[c.type] = n;
      });
      if (isEdit && resolve.resourceProject) {
        return marketplaceResourceProjectsPartialUpdate({
          path: { uuid: resolve.resourceProject.uuid },
          body: {
            name: values.name,
            description: values.description || '',
            ...(limitComponents.length ? { limits: limitsPayload } : {}),
          },
        });
      } else {
        return marketplaceResourceProjectsCreate({
          body: {
            resource: resolve.resource.uuid,
            name: values.name,
            description: values.description || '',
            ...(limitComponents.length ? { limits: limitsPayload } : {}),
          },
        });
      }
    },
    successMessage: isEdit
      ? translate('The project has been updated.')
      : translate('The project has been created.'),
    errorMessage: isEdit
      ? translate('Unable to update project.')
      : translate('Unable to create project.'),
    refetch: resolve.refetch,
  });

  return (
    <Form
      onSubmit={(values) =>
        mutation.mutateAsync(values).catch(() => {
          /* error handled by useManagedMutation */
        })
      }
      initialValues={
        resolve.resourceProject
          ? {
              name: resolve.resourceProject.name,
              description: resolve.resourceProject.description,
              limits: initialLimits,
            }
          : { limits: {} }
      }
      render={({ handleSubmit, submitting, invalid }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            iconNode={isEdit ? null : <PlusCircleIcon weight="bold" />}
            iconColor="success"
            title={
              isEdit
                ? translate('Edit {name}', {
                    name: resolve.resourceProject?.name,
                  })
                : translate('Create project')
            }
            closeButton
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <Field
              name="name"
              component={FormGroup as any}
              label={translate('Name')}
              required
              validate={required}
            >
              <StringField />
            </Field>
            <Field
              name="description"
              component={FormGroup as any}
              label={translate('Description')}
            >
              <TextField />
            </Field>
            {limitComponents.length > 0 && (
              <div className="mb-7">
                <label className="form-label fw-bold">
                  {translate('Limits')}
                  {limitsRequired && (
                    <span className="text-danger ms-1" aria-hidden="true">
                      *
                    </span>
                  )}
                </label>
                <p className="form-text text-muted mt-0 mb-2">
                  {limitsRequired
                    ? translate(
                        'Required: every component must have a value greater than zero.',
                      )
                    : translate(
                        'Optional per-component caps for this project.',
                      )}
                </p>
                <Card className="card-table card-bordered full-width">
                  <Card.Body className="p-0">
                    <table className="table table-row-bordered align-middle mb-0">
                      <thead>
                        <tr>
                          <th>{translate('Component')}</th>
                          <th style={{ width: 180 }}>{translate('Limit')}</th>
                          <th>
                            {policy === 'aggregate'
                              ? translate('Available')
                              : policy === 'per_project'
                                ? translate('Maximum')
                                : ''}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {limitComponents.map((c) => {
                          const hint = renderLimitHint(c);
                          // When the offering requires limits, every
                          // component must have a positive value. The
                          // backend mirrors this rule -- enforcing it
                          // inline avoids a round-trip + opaque API
                          // error message.
                          const validateRequired = (v: unknown) => {
                            if (!limitsRequired) return undefined;
                            const n = Number(v);
                            if (
                              v == null ||
                              v === '' ||
                              Number.isNaN(n) ||
                              n <= 0
                            ) {
                              return translate('Required');
                            }
                            return undefined;
                          };
                          return (
                            <tr key={c.type}>
                              <td>
                                {c.name ?? c.type}
                                {c.measured_unit ? ` (${c.measured_unit})` : ''}
                                {limitsRequired && (
                                  <span
                                    className="text-danger ms-1"
                                    aria-hidden="true"
                                  >
                                    *
                                  </span>
                                )}
                              </td>
                              <td>
                                <Field
                                  name={`limits.${c.type}`}
                                  component={NumberField as any}
                                  parse={(v) =>
                                    v === '' || v === undefined || v === null
                                      ? undefined
                                      : Number(v)
                                  }
                                  min={0}
                                  validate={validateRequired}
                                />
                              </td>
                              <td className="text-muted">
                                {renderFieldOrDash(hint)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Card.Body>
                </Card>
              </div>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
