import { useQueryClient } from '@tanstack/react-query';
import { FC, useMemo } from 'react';
import {
  proposalProtectedCallsAvailableComplianceChecklistsList,
  proposalProtectedCallsPartialUpdate,
} from 'waldur-js-client';

import {
  AsyncSelectEditField,
  BooleanEditField,
  EditFieldProvider,
  NumberEditField,
} from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { createLoadOptions } from '@/form/select/createLoadOptions';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

/**
 * Compares the submitted fixed duration with the stored one. The number input
 * yields a string, the call carries a number, and a cleared field arrives as
 * null, so both sides are normalized before comparing.
 *
 * Returns null when the duration is absent from the payload or unchanged — the
 * backend only rewrites proposal durations when the value actually changes.
 */
export const resolveFixedDurationChange = (
  call: Pick<Call, 'fixed_duration_in_days'>,
  formData: Record<string, any>,
): 'set' | 'clear' | null => {
  if (!('fixed_duration_in_days' in formData)) {
    return null;
  }
  const submitted = formData.fixed_duration_in_days;
  const next =
    submitted === null || submitted === '' || submitted === undefined
      ? null
      : Number(submitted);
  const current = call.fixed_duration_in_days ?? null;

  if (next === current) {
    return null;
  }
  return next === null ? 'clear' : 'set';
};

/**
 * The backend accepts a positive number of days only. Validation lives here
 * rather than in the control's `min`, because `BaseNumberField` clamps an
 * out-of-range value on blur — with `min=1` an emptied input would snap to 1
 * and silently set a one-day duration instead of clearing it.
 */
export const validateFixedDuration = (value: any) => {
  if (value === null || value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1
    ? undefined
    : translate('Enter a whole number of days, 1 or more.');
};

interface GeneralConfigurationSectionProps {
  call: Call;
  refetch: () => void;
  isReadOnly?: boolean;
}

export const GeneralConfigurationSection: FC<
  GeneralConfigurationSectionProps
> = (props) => {
  const queryClient = useQueryClient();
  const { confirm } = useModal();

  const { mutateAsync: updateCall } = useManagedMutation({
    mutationFn: (body: any) =>
      proposalProtectedCallsPartialUpdate({
        path: { uuid: props.call.uuid },
        body,
      }),
    successMessage: translate('The call has been updated.'),
    errorMessage: translate('Unable to update call.'),
    onSuccess: async () => {
      props.refetch();
      await queryClient.invalidateQueries({
        queryKey: ['Call', props.call.uuid],
      });
    },
    closeModal: false,
  });

  const handleSubmit = async (formData: Record<string, any>) => {
    const body = { ...formData };
    if ('compliance_checklist' in body) {
      body.compliance_checklist =
        (body.compliance_checklist as any)?.value ||
        body.compliance_checklist ||
        null;
    }

    const durationChange = resolveFixedDurationChange(props.call, body);
    if (durationChange) {
      // Prompt only when there is something to rewrite, but send the flag on
      // every change: the cached flag may be stale by the time this lands.
      if (props.call.has_proposals) {
        try {
          await confirm(
            translate('Confirmation'),
            durationChange === 'set'
              ? translate(
                  'This will also update the duration of connected proposals which have not been allocated yet. Continue?',
                )
              : translate(
                  'This will clear the duration of connected proposals which have not been allocated yet, so applicants will be able to choose it themselves. Continue?',
                ),
          );
        } catch {
          return Promise.reject();
        }
      }
      // The backend refuses to rewrite proposal durations without it.
      body.confirm_duration_propagation = true;
    }

    return updateCall(body);
  };

  const loadComplianceChecklists = useMemo(
    () =>
      createLoadOptions(
        proposalProtectedCallsAvailableComplianceChecklistsList,
        'name',
        {
          checklist_type: 'proposal_compliance',
          customer_uuid: props.call.customer_uuid,
        },
      ),
    [props.call.customer_uuid],
  );

  return (
    <FormTable.Card
      title={translate('General configuration')}
      className="card-bordered mb-5"
    >
      <EditFieldProvider
        scope={props.call}
        callback={handleSubmit}
        readOnlyReason={
          props.isReadOnly ? getCallReadOnlyReason(props.call) : undefined
        }
      >
        <FormTable>
          <NumberEditField
            name="fixed_duration_in_days"
            label={translate('Fixed duration for granted projects (in days)')}
            disabled={props.isReadOnly}
            validate={validateFixedDuration}
            renderValue={(value) =>
              value ? translate('{n} days', { n: value }) : 'N/A'
            }
          />
          <AsyncSelectEditField
            name="compliance_checklist"
            label={translate('Compliance checklist')}
            description={translate(
              'Optional checklist for proposal compliance evaluation. Can only be changed when no proposals exist for this call.',
            )}
            loadOptions={loadComplianceChecklists}
            getOptionValue={(option) => option.uuid}
            getOptionLabel={(option) => option.name}
            isClearable={true}
            placeholder={translate('Select compliance checklist (optional)')}
            disabled={props.isReadOnly || props.call.has_proposals}
            tooltip={
              !props.isReadOnly && props.call.has_proposals
                ? translate(
                    'The compliance checklist cannot be changed once proposals exist for this call.',
                  )
                : undefined
            }
            renderValue={() =>
              props.call.compliance_checklist_name ||
              translate('Not configured')
            }
          />
          <BooleanEditField
            name="reviewer_identity_visible_to_submitters"
            label={translate('Reviewer identity visible to applicants')}
            disabled={props.isReadOnly}
            renderValue={(value) =>
              value ? translate('Yes') : translate('No')
            }
          />
          <BooleanEditField
            name="reviews_visible_to_submitters"
            label={translate('Reviews visible to applicants')}
            disabled={props.isReadOnly}
            renderValue={(value) =>
              value ? translate('Yes') : translate('No')
            }
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
