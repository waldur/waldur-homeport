import { FC } from 'react';
import { Form } from 'react-final-form';
import {
  ResourcePoolCell,
  ResourcePoolUsage,
  proposalProtectedCallsResourcePoolsDestroy,
  proposalProtectedCallsResourcePoolsPartialUpdate,
  proposalProtectedCallsResourcePoolsSet,
} from 'waldur-js-client';

import { NumberGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { BUDGET_QUERIES } from '@/proposals/budgets';

export interface PoolEditDialogProps {
  resolve: {
    callUuid: string;
    row: ResourcePoolUsage;
    /** The whole call, then each round: one field each. */
    scopes: { title: string; cell: ResourcePoolCell }[];
    refetch(): void;
  };
}

type PoolChange = { cell: ResourcePoolCell; offered_total: number | null };

const savePool = (
  callUuid: string,
  row: ResourcePoolUsage,
  { cell, offered_total }: PoolChange,
) => {
  if (offered_total === null) {
    return proposalProtectedCallsResourcePoolsDestroy({
      path: { uuid: callUuid, obj_uuid: cell.pool_uuid },
    });
  }
  if (cell.pool_uuid) {
    return proposalProtectedCallsResourcePoolsPartialUpdate({
      path: { uuid: callUuid, obj_uuid: cell.pool_uuid },
      body: { offered_total },
    });
  }
  return proposalProtectedCallsResourcePoolsSet({
    path: { uuid: callUuid },
    // A component without a rule yet is named by its offering and
    // type: the backend adds a rule that bounds nothing.
    body: {
      ...(row.offering_component_uuid
        ? { offering_component_uuid: row.offering_component_uuid }
        : {
            requested_offering: row.requested_offering_uuid,
            component: row.component_type,
          }),
      round_uuid: cell.round_uuid,
      offered_total,
    },
  });
};

/**
 * The pools that changed, saved one after another. A component without a rule
 * yet gets one with its first pool; a second pool saved at the same time would
 * add the same rule and be refused.
 */
export const savePoolChanges = async (
  callUuid: string,
  row: ResourcePoolUsage,
  changes: PoolChange[],
) => {
  for (const change of changes) {
    await savePool(callUuid, row, change);
  }
};

/**
 * What the pools offer of a component, for the whole call and each round.
 * An empty total removes a pool; a scope without one takes any amount.
 */
export const PoolEditDialog: FC<PoolEditDialogProps> = ({
  resolve: { callUuid, row, scopes, refetch },
}) => {
  const mutation = useManagedMutation<any, any, PoolChange[]>({
    // Only the pools that changed.
    mutationFn: (changes) => savePoolChanges(callUuid, row, changes),
    successMessage: translate('The resource pool has been saved.'),
    errorMessage: translate('Unable to save the resource pool.'),
    refetch,
    invalidateQueries: BUDGET_QUERIES,
  });

  const fieldName = (index: number) => `pool_${index}`;
  const toTotal = (value: unknown) =>
    value === '' || value === null || value === undefined
      ? null
      : Number(value);
  const submit = (values: Record<string, number | string | null>) =>
    mutation.mutateAsync(
      scopes
        .map(({ cell }, index) => ({
          cell,
          offered_total: toTotal(values[fieldName(index)]),
        }))
        .filter(
          ({ cell, offered_total }) =>
            offered_total !==
            toTotal(cell.pool_uuid ? cell.offered_total : null),
        ),
    );

  return (
    <Form
      onSubmit={submit}
      initialValues={Object.fromEntries(
        scopes.map(({ cell }, index) => [
          fieldName(index),
          cell.pool_uuid ? cell.offered_total : '',
        ]),
      )}
      render={({ handleSubmit, submitting }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('Edit pools')}
            subtitle={`${row.offering_name} / ${
              row.component_name || row.component_type
            }`}
            footer={
              <>
                <CloseDialogButton />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                />
              </>
            }
          >
            {scopes.map(({ title }, index) => (
              <NumberGroup
                key={fieldName(index)}
                name={fieldName(index)}
                label={title}
                min={0}
                unit={row.measured_unit}
                placeholder={translate('No pool')}
                description={
                  index === scopes.length - 1
                    ? translate(
                        'Leave empty for no pool: any amount can be awarded.',
                      )
                    : undefined
                }
                spaceless={index === scopes.length - 1}
              />
            ))}
          </ModalDialog>
        </form>
      )}
    />
  );
};
