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
import { StringGroup, SubmitButton, TextGroup } from '@/form';
import { NumberField } from '@/form/NumberField';
import { translate } from '@/i18n';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { renderFieldOrDash } from '@/table/utils';

type LimitComponent = {
  type: string;
  name?: string;
  measured_unit?: string;
  billing_type?: string;
  is_prepaid?: boolean;
};

const isLimitEligible = (c: LimitComponent): boolean =>
  c.billing_type === 'limit' ||
  (c.billing_type === 'one' && c.is_prepaid === true);

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

  // Sub-allocatable components: LIMIT-billed plus prepaid ONE_TIME
  // (mirrors backend utils.get_components_map).
  const limitComponents = (resolve.offering?.components ?? []).filter(
    isLimitEligible,
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

  // Effective per-component cap. Returns null when there's no parent
  // limit OR when the offering policy is 'none' (free-form): in those
  // cases the input is not bounded.
  const computeCap = (c: LimitComponent): number | null => {
    const total = resourceLimits[c.type];
    if (total == null) return null;
    if (policy === 'per_project') return total;
    if (policy === 'aggregate') {
      const used = siblingTotals[c.type] ?? 0;
      return Math.max(total - used, 0);
    }
    return null;
  };

  const renderLimitHint = (c: LimitComponent) => {
    const cap = resourceLimits[c.type];
    if (cap == null) return null; // No parent cap → no hint.
    const unit = c.measured_unit ? ` ${c.measured_unit}` : '';
    if (policy === 'aggregate') {
      const used = siblingTotals[c.type] ?? 0;
      const remaining = Math.max(cap - used, 0);
      return translate('{remaining} of {cap}{unit}', {
        remaining,
        cap,
        unit,
      });
    }
    if (policy === 'per_project') {
      return translate('{cap}{unit}', { cap, unit });
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
    // Refresh the parent resource so the quota header (e.g. "CPU
    // 25/100") reflects the new RP's allocation immediately instead
    // of waiting for the next page load.
    invalidateQueries: [
      { queryKey: ['resource-details', resolve.resource.uuid] },
    ],
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
            footer={
              <SubmitButton
                disabled={invalid || submitting}
                submitting={submitting}
                label={isEdit ? translate('Save') : translate('Create')}
              />
            }
          >
            <StringGroup
              name="name"
              label={translate('Name')}
              required
              validate={required}
            />
            <TextGroup name="description" label={translate('Description')} />
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
                          const cap = computeCap(c);
                          // Combined validator: required-rule (when the
                          // offering enforces limits) AND cap-rule (when
                          // a parent quota exists). Backend mirrors both
                          // rules -- doing them inline avoids a
                          // round-trip plus opaque API error message.
                          const validateLimit = (v: unknown) => {
                            const isEmpty =
                              v == null || v === '' || Number.isNaN(Number(v));
                            if (limitsRequired) {
                              if (isEmpty || Number(v) <= 0) {
                                return translate('Required');
                              }
                            }
                            if (cap != null && !isEmpty && Number(v) > cap) {
                              return translate('Exceeds maximum of {cap}', {
                                cap,
                              });
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
                                  parse={(v) =>
                                    v === '' || v === undefined || v === null
                                      ? undefined
                                      : Number(v)
                                  }
                                  validate={validateLimit}
                                >
                                  {({ input, meta }) => (
                                    <NumberField
                                      input={input}
                                      meta={meta}
                                      min={0}
                                      max={cap ?? undefined}
                                    />
                                  )}
                                </Field>
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
