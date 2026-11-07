import { useMemo } from 'react';
import { Form } from 'react-final-form';
import {
  CallOfferingComponent,
  RequestableComponent,
  proposalProtectedCallsOfferingComponentsPartialUpdate,
  proposalProtectedCallsOfferingComponentsSet,
} from 'waldur-js-client';

import { BooleanGroup, NumberGroup, SubmitButton } from '@/form';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { ModalDialog } from '@/modal/ModalDialog';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { formatComponentUnit } from '@/proposals/budgets';

import { Call } from '../../types';

interface ComponentRuleValues {
  min_per_proposal: number | null;
  max_per_proposal: number | null;
  default_amount: number | null;
  is_fixed: boolean;
}

const toNumber = (value: any) =>
  value === null || value === undefined || value === '' ? null : Number(value);

export interface ComponentRuleDialogResolve {
  call: Call;
  requestedOfferingUuid: string;
  offeringName: string;
  component: RequestableComponent;
  rule?: CallOfferingComponent;
  refetch(): void;
}

/** What a proposal may request of one component of a call offering. */
export const ComponentRuleDialog = ({
  resolve,
}: {
  resolve: ComponentRuleDialogResolve;
}) => {
  const {
    call,
    requestedOfferingUuid,
    offeringName,
    component,
    rule,
    refetch,
  } = resolve;
  const unit = formatComponentUnit(
    component.measured_unit,
    component.limit_period,
  );

  const initialValues = useMemo<ComponentRuleValues>(
    () => ({
      min_per_proposal: rule?.min_per_proposal ?? null,
      max_per_proposal: rule?.max_per_proposal ?? null,
      default_amount: rule?.default_amount ?? null,
      is_fixed: rule?.is_fixed ?? false,
    }),
    [rule],
  );

  const mutation = useManagedMutation<any, any, ComponentRuleValues>({
    mutationFn: (values) => {
      const fixed = Boolean(values.is_fixed);
      const body = {
        min_per_proposal: fixed ? null : toNumber(values.min_per_proposal),
        max_per_proposal: fixed ? null : toNumber(values.max_per_proposal),
        default_amount: toNumber(values.default_amount),
        is_fixed: fixed,
      };
      return rule
        ? proposalProtectedCallsOfferingComponentsPartialUpdate({
            path: { uuid: call.uuid, obj_uuid: rule.uuid },
            body,
          })
        : proposalProtectedCallsOfferingComponentsSet({
            path: { uuid: call.uuid },
            body: {
              ...body,
              requested_offering_uuid: requestedOfferingUuid,
              component_type: component.type,
            },
          });
    },
    successMessage: translate('The component rule has been saved.'),
    errorMessage: translate('Unable to save the component rule.'),
    refetch,
  });

  return (
    <Form<ComponentRuleValues>
      initialValues={initialValues}
      onSubmit={(values) => mutation.mutateAsync(values)}
      render={({ handleSubmit, submitting, values }) => (
        <form onSubmit={handleSubmit}>
          <ModalDialog
            title={translate('{offering} / {component}', {
              offering: offeringName,
              component: component.name || component.type,
            })}
            subtitle={translate(
              'What a proposal may request of the component, in {unit}.',
              { unit: unit || translate('units') },
            )}
            footer={
              <>
                <CloseDialogButton className="min-w-[125px]" />
                <SubmitButton
                  submitting={submitting}
                  label={translate('Save')}
                  variant="primary"
                  className="min-w-[125px]"
                />
              </>
            }
          >
            <BooleanGroup
              name="is_fixed"
              label={translate('Fixed amount')}
              description={translate(
                'Every proposal requests exactly this amount and cannot change it.',
              )}
            />
            {!values.is_fixed && (
              <>
                <NumberGroup
                  name="min_per_proposal"
                  label={translate('Minimum per proposal')}
                  unit={component.measured_unit}
                  min={0}
                />
                <NumberGroup
                  name="max_per_proposal"
                  label={translate('Maximum per proposal')}
                  unit={component.measured_unit}
                  min={0}
                />
              </>
            )}
            <NumberGroup
              name="default_amount"
              label={
                values.is_fixed
                  ? translate('Amount')
                  : translate('Default amount')
              }
              description={
                values.is_fixed
                  ? undefined
                  : translate('What the request form starts from.')
              }
              unit={component.measured_unit}
              min={0}
              required={values.is_fixed}
            />
          </ModalDialog>
        </form>
      )}
    />
  );
};
