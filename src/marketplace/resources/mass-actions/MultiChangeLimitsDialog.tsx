import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { Field, Form } from 'react-final-form';
import {
  marketplaceResourcesOfferingRetrieve,
  marketplaceResourcesUpdateLimits,
  Resource,
} from 'waldur-js-client';

import { AlertItem } from '@/core/AlertItem';
import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { composeValidators, required } from '@/core/validators';
import { FormGroup, NumberField, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import {
  filterOfferingComponents,
  getFormLimitParser,
  getFormLimitSerializer,
} from '@/marketplace/common/registry';
import { maxAmount, minAmount } from '@/marketplace/common/utils';
import { parseOfferingLimits } from '@/marketplace/offerings/store/limits';
import { checkOrderCanBeApproved } from '@/marketplace/orders/actions/selectors';
import { ChangedLimitField } from '@/marketplace/resources/change-limits/ChangedLimitField';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useBatchMutation } from '@/modal/useBatchMutation';
import { renderFieldOrDash } from '@/table/utils';
import { useUser } from '@/workspace/hooks';

interface FormData {
  limits: Record<string, number>;
}

interface MultiChangeLimitsDialogProps {
  resolve: {
    rows: Resource[];
    refetch?(): void;
  };
}

/** Most restrictive bound across offerings: highest min, lowest max. */
const intersectBounds = (
  boundsList: Array<{ min?: number; max?: number } | undefined>,
) => {
  const mins = boundsList
    .map((b) => b?.min)
    .filter((v): v is number => v != null);
  const maxs = boundsList
    .map((b) => b?.max)
    .filter((v): v is number => v != null);
  return {
    min: mins.length ? Math.max(...mins) : undefined,
    max: maxs.length ? Math.min(...maxs) : undefined,
  };
};

/**
 * Loads every distinct offering across the selected tenants and derives:
 * - commonComponents: limit components present in ALL offerings (editable here);
 * - skippedComponents: components present in only some offerings (left as-is);
 * - unionComponents: every component, for the preview table;
 * - bounds: most-restrictive min/max per common component (valid for all);
 * - (de)serializer: shared by every OpenStack tenant offering.
 */
const loadData = async (rows: Resource[]) => {
  // One representative resource per distinct offering — components only depend
  // on the offering, so we don't need to fetch the same one repeatedly.
  const repByOffering = new Map<string, Resource>();
  for (const row of rows) {
    const key = row.offering_uuid || row.uuid;
    if (!repByOffering.has(key)) {
      repByOffering.set(key, row);
    }
  }
  const offerings = await Promise.all(
    [...repByOffering.values()].map((row) =>
      marketplaceResourcesOfferingRetrieve({ path: { uuid: row.uuid } }).then(
        (res) => res.data,
      ),
    ),
  );

  const offeringType = offerings[0].type;
  const limitSerializer = getFormLimitSerializer(offeringType);
  const limitParser = getFormLimitParser(offeringType);

  const perOfferingComponents = offerings.map((offering) =>
    filterOfferingComponents(offering).filter(
      (component) => component.billing_type === 'limit' || component.is_prepaid,
    ),
  );

  // Union of component metadata by type (first occurrence wins for label/unit).
  const unionMap = new Map<string, any>();
  for (const components of perOfferingComponents) {
    for (const component of components) {
      if (!unionMap.has(component.type)) {
        unionMap.set(component.type, component);
      }
    }
  }

  const typeSets = perOfferingComponents.map(
    (components) => new Set(components.map((component) => component.type)),
  );
  const commonTypes = new Set(
    [...unionMap.keys()].filter((type) =>
      typeSets.every((set) => set.has(type)),
    ),
  );

  const unionComponents = [...unionMap.values()];
  const commonComponents = unionComponents.filter((component) =>
    commonTypes.has(component.type),
  );
  const skippedComponents = unionComponents.filter(
    (component) => !commonTypes.has(component.type),
  );

  // Bounds for each common component, intersected across offerings.
  const offeringLimitsList = offerings.map((offering) =>
    parseOfferingLimits(offering),
  );
  const bounds: Record<string, { min?: number; max?: number }> = {};
  for (const component of commonComponents) {
    bounds[component.type] = intersectBounds(
      offeringLimitsList.map(
        (offeringLimits) => offeringLimits[component.type],
      ),
    );
  }

  // Pre-fill the editable inputs from the first tenant's current limits.
  const firstLimits = limitParser(rows[0].limits || {});
  const initialLimits: Record<string, number> = {};
  for (const component of commonComponents) {
    initialLimits[component.type] = firstLimits[component.type] ?? 0;
  }

  return {
    limitSerializer,
    limitParser,
    commonComponents,
    skippedComponents,
    unionComponents,
    commonTypes,
    bounds,
    initialLimits,
  };
};

export const MultiChangeLimitsDialog: FC<MultiChangeLimitsDialogProps> = (
  props,
) => {
  const { rows, refetch } = props.resolve;
  const count = rows.length;
  const user = useUser();

  const orderCanBeApproved = rows.every((resource) =>
    checkOrderCanBeApproved(
      user,
      { uuid: resource.customer_uuid },
      { uuid: resource.project_uuid },
    ),
  );

  const distinctOfferings = [...new Set(rows.map((row) => row.offering_uuid))]
    .sort()
    .join(',');

  const {
    data,
    isLoading,
    error,
    refetch: reloadOffering,
  } = useQuery({
    // Components depend on the set of offerings; initial values on the first
    // row. Keying on both keeps the cache correct without over-splitting it.
    queryKey: ['MultiChangeLimitsDialog', distinctOfferings, rows[0].uuid],
    queryFn: () => loadData(rows),
  });

  const updateMutation = useBatchMutation<Resource, FormData>({
    rows,
    mutationFn: (resource, variables) => {
      if (!data) {
        return Promise.reject(new Error('Offering data is not loaded yet.'));
      }
      // The backend replaces the whole limits dict on update, so to leave the
      // skipped (non-common) components unchanged we re-send each tenant's own
      // current value for them and apply the edited common values on top.
      // Building the payload from known component types only (rather than
      // spreading the raw stored limits) avoids resurfacing stale keys that the
      // backend would reject.
      const current = data.limitParser(resource.limits || {});
      const preserved: Record<string, number> = {};
      for (const component of data.unionComponents) {
        if (
          !data.commonTypes.has(component.type) &&
          current[component.type] != null
        ) {
          preserved[component.type] = current[component.type];
        }
      }
      const merged = { ...preserved, ...variables.limits };
      return marketplaceResourcesUpdateLimits({
        path: { uuid: resource.uuid },
        body: { limits: data.limitSerializer(merged) },
      });
    },
    successMessage: translate(
      'Limits change has been requested for {count} VPCs.',
      { count },
    ),
    renderPartialSuccessMessage: (n) =>
      translate('Limits change requested for {n} of {count} VPCs.', {
        n,
        count,
      }),
    renderErrorMessage: (n) =>
      translate('Failed to request limits change for {n} of {count} VPCs.', {
        n,
        count,
      }),
    refetch,
  });

  const hasEditableComponents = (data?.commonComponents.length ?? 0) > 0;

  return (
    <Form<FormData>
      onSubmit={(formData) =>
        updateMutation.mutateAsync(formData).catch(() => {})
      }
      initialValues={data ? { limits: data.initialLimits } : { limits: {} }}
      render={({ handleSubmit, submitting, invalid, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Change VPC limits')}
            subtitle={translate('{count} VPCs selected', { count })}
            footer={
              <>
                <CloseDialogButton />
                {!isLoading && !error && hasEditableComponents && (
                  <SubmitButton
                    submitting={submitting}
                    invalid={invalid}
                    label={
                      orderCanBeApproved
                        ? translate('Submit')
                        : translate('Request for a change')
                    }
                  />
                )}
              </>
            }
          >
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <LoadingErred
                loadData={() => reloadOffering()}
                message={translate('Unable to load offering limits.')}
              />
            ) : (
              <>
                {data.skippedComponents.length > 0 && (
                  <AlertItem
                    variant="info"
                    className="mb-4"
                    title={translate('Some components are not editable here')}
                    body={translate(
                      '{names} are not common to all selected VPCs, so they are left unchanged in this order.',
                      {
                        names: data.skippedComponents
                          .map((component) => component.name)
                          .join(', '),
                      },
                    )}
                  />
                )}

                {hasEditableComponents ? (
                  <>
                    <p className="text-muted">
                      {translate(
                        'The new limits below will be applied to all {count} selected VPCs.',
                        { count },
                      )}
                    </p>
                    {data.commonComponents.map((component) => {
                      const min = data.bounds[component.type]?.min;
                      const max = data.bounds[component.type]?.max;
                      return (
                        <FormGroup
                          key={component.type}
                          label={component.name}
                          required
                        >
                          {/* Numeric input: keep it at a normal field width
                              instead of stretching to the full modal. */}
                          <div className="mw-325px">
                            <Field
                              name={`limits.${component.type}`}
                              validate={composeValidators(
                                required,
                                ...(min ? [minAmount(min)] : []),
                                ...(max ? [maxAmount(max)] : []),
                              )}
                              parse={(value) =>
                                value === '' ? undefined : Number(value)
                              }
                            >
                              {({ input }) => (
                                <NumberField
                                  input={input}
                                  unit={component.measured_unit}
                                  min={min ?? 0}
                                  max={max}
                                />
                              )}
                            </Field>
                          </div>
                        </FormGroup>
                      );
                    })}
                  </>
                ) : (
                  <AlertItem
                    variant="warning"
                    className="mb-4"
                    title={translate('No common editable limits')}
                    body={translate(
                      'The selected VPCs share no limit components that can be changed together. Narrow the selection to VPCs of the same offering.',
                    )}
                  />
                )}

                <h6 className="mt-6 mb-3">{translate('Preview')}</h6>
                <div className="table-responsive">
                  <table className="table table-row-bordered align-middle">
                    <thead>
                      <tr>
                        <th>{translate('Resource')}</th>
                        <th>{translate('Project')}</th>
                        {data.unionComponents.map((component) => (
                          <th key={component.type} className="text-nowrap">
                            {component.name}
                            {component.measured_unit
                              ? ` (${component.measured_unit})`
                              : ''}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((resource) => {
                        const before = data.limitParser(resource.limits || {});
                        return (
                          <tr key={resource.uuid}>
                            <td>{resource.name}</td>
                            <td>{renderFieldOrDash(resource.project_name)}</td>
                            {data.unionComponents.map((component) => {
                              const isCommon = data.commonTypes.has(
                                component.type,
                              );
                              const beforeValue = before[component.type];
                              // A resource has the component if it's common to
                              // all offerings or carries a value of its own.
                              const hasComponent =
                                isCommon || beforeValue !== undefined;
                              if (!hasComponent) {
                                return (
                                  <td key={component.type}>
                                    {renderFieldOrDash(undefined)}
                                  </td>
                                );
                              }
                              // Skipped components are not edited, so their
                              // "after" equals "before" (unchanged).
                              const beforeNum = beforeValue ?? 0;
                              const afterNum =
                                (isCommon
                                  ? values.limits?.[component.type]
                                  : beforeValue) ?? 0;
                              const changed = afterNum - beforeNum;
                              return (
                                <td
                                  key={component.type}
                                  className="text-nowrap"
                                >
                                  <span className="d-inline-flex align-items-center gap-2">
                                    <span>
                                      {changed !== 0
                                        ? `${beforeNum} → ${afterNum}`
                                        : afterNum}
                                    </span>
                                    <ChangedLimitField changedLimit={changed} />
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </ModalDialog>
        </form>
      )}
    />
  );
};
