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
import { useManagedMutation } from '@/modal/useManagedMutation';
import { CallDurationPolicy } from '@/proposals/CallDurationPolicy';
import { Call } from '@/proposals/types';
import { getCallReadOnlyReason } from '@/proposals/utils';

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

  const handleSubmit = (formData: Record<string, any>) => {
    const body = { ...formData };
    if ('compliance_checklist' in body) {
      body.compliance_checklist =
        (body.compliance_checklist as any)?.value ||
        body.compliance_checklist ||
        null;
    }

    // No confirmation for a changed fixed duration: allocation reads it from
    // the call when the project is created, so unallocated proposals follow
    // it without any of their rows being rewritten.
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
            description={translate(
              'Every granted project lasts exactly this long, and no prepaid subscription requested under the call may run past it. Leave empty to let the longest subscription requested decide.',
            )}
            disabled={props.isReadOnly}
            validate={validateFixedDuration}
            renderValue={(value) =>
              value ? (
                <CallDurationPolicy call={{ fixed_duration_in_days: value }} />
              ) : (
                translate('Not fixed')
              )
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
