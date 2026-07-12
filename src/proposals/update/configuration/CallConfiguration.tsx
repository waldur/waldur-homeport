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
import { ApplicantVisibilitySection } from '@/proposals/update/applicant-visibility/ApplicantVisibilitySection';

import { WorkflowStepsSection } from '../workflow-steps/WorkflowStepsSection';

import { CallResourceTemplates } from './CallResourceTemplates';

interface CallConfigurationProps {
  call: Call;
  refetch;
  isReadOnly?: boolean;
}

export const CallConfiguration: FC<CallConfigurationProps> = (props) => {
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
    if (formData.fixed_duration_in_days) {
      try {
        await confirm(
          translate('Confirmation'),
          translate(
            'This will also update durations of connected proposals in Draft or In Review states. Continue?',
          ),
        );
      } catch {
        return Promise.reject();
      }
    }

    const body = { ...formData };
    if ('compliance_checklist' in body) {
      body.compliance_checklist =
        (body.compliance_checklist as any)?.value ||
        body.compliance_checklist ||
        null;
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
    <>
      <FormTable.Card
        title={translate('General configuration')}
        className="card-bordered mb-5"
      >
        <EditFieldProvider scope={props.call} callback={handleSubmit}>
          <FormTable>
            <NumberEditField
              name="fixed_duration_in_days"
              label={translate('Fixed duration for granted projects (in days)')}
              disabled={props.isReadOnly}
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
              disabled={props.isReadOnly}
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

      <ApplicantVisibilitySection
        call={props.call}
        refetch={props.refetch}
        isReadOnly={props.isReadOnly}
      />

      <CallResourceTemplates call={props.call} isReadOnly={props.isReadOnly} />

      <div className="mt-5">
        <WorkflowStepsSection call={props.call} isReadOnly={props.isReadOnly} />
      </div>
    </>
  );
};
